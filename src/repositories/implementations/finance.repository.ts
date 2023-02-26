import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/finance.model"
import { injectable } from "inversify";
import IFinanceRepository from "../interfaces/ifinance.repository";
import FinanceDTO from "../../models/dto-models/finance.dto";
import mongoose from "mongoose";
import { TYPE, PROCEDURE_OR_CONSULTANT } from "../../enums/finance.enum";
import FinanceToggleDTO from "../../models/dto-models/finance.toggle.dto";

@injectable()
class FinanceRepository extends Repository<FinanceDTO> implements IFinanceRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;


    getAllFinance(_id: string, dayStartTime: string | number | Date, dayEndTime: string | number | Date): Promise<FinanceToggleDTO> {
        return this.aggregate([{
            $facet: {
                doctorPay: [
                    {
                        $match: {
                            admin: new mongoose.Types.ObjectId(_id),
                            type: TYPE.DOCTOR_PAY,
                            time: {
                                $gte: dayStartTime,
                                $lte: dayEndTime
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'doctors',
                            localField: 'doctor',
                            foreignField: '_id',
                            as: 'doctor'
                        }
                    },
                    {
                        $unwind: {
                            path: '$doctor',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            doctor: 1,
                            amount: 1,
                            time: 1
                        }
                    },
                ],
                customerPay: [
                    {
                        $match: {
                            type: TYPE.CUSTOMER_PAY,
                            paymentTypes: {
                                $elemMatch: {
                                    admin: new mongoose.Types.ObjectId(_id)
                                }
                            },
                        }
                    },
                    {
                        $addFields: {
                            paymentTypes: {
                                $filter: {
                                    input: '$paymentTypes',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $eq: ['$$item.admin', new mongoose.Types.ObjectId(_id)], },
                                            { $lte: [{ $subtract: ['$$item.time', new Date("1970-01-01")] }, new Date(dayEndTime).getTime()] },
                                            { $gte: [{ $subtract: ['$$item.time', new Date("1970-01-01")] }, new Date(dayStartTime).getTime()] },
                                        ],
                                    }
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            "paymentTypes.0": {
                                $exists: true
                            }
                        }
                    },
                    {
                        $unwind: {
                            path: '$paymentTypes',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'procedures',
                            localField: 'paymentTypes.procedures',
                            foreignField: '_id',
                            as: 'paymentTypes.procedures'
                        }
                    },
                    {
                        $lookup: {
                            from: 'doctors',
                            localField: 'doctor',
                            foreignField: '_id',
                            as: 'doctor'
                        }
                    },
                    {
                        $lookup: {
                            from: 'user',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: '$doctor',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            doctor: 1,
                            user: 1,
                            paymentType: { $cond: [{ $gte: [{ $size: "$paymentTypes.procedures" }, 1] }, PROCEDURE_OR_CONSULTANT.PROCEDURE_FEE, PROCEDURE_OR_CONSULTANT.CONSULTANT_FEE] },
                            procedures: '$paymentTypes.procedures',
                            amount: '$paymentTypes.amount',
                            time: '$paymentTypes.time'
                        }
                    }
                ],
            },
        }
        ]) as unknown as Promise<FinanceToggleDTO>
    }


    getSalesByDate(startDate: string | number | Date, endDate: string | number | Date, zone = "Asia/Dubai"): Promise<any> {
        return this.aggregate([
            { $match: { $or: [{ "$or": [{ "customerType": "HOME_SAMPLE" }, { "customerType": "WALK_IN" }] }] } },
            {
                $addFields: {
                    "time": { "$dateToString": { "format": "%Y-%m-%d", "date": "$time", "timezone": zone } },
                }
            },//
            //    {$match:{
            //        
            //    $expr:{$or:[{$eq:["customerType" , "HOME_SAMPLE"]},{$eq:["customerType","WALK_IN" ]}]}
            //    }},
            { $match: { "status": "COMPLETED" } },
            {
                $addFields: {
                    startInitDate: new Date(startDate),
                    endInitDate: new Date(endDate)
                }
            },
            {
                "$addFields": {

                    "startDate": {

                        $dateToString: {
                            date: "$startInitDate",
                            format: "%Y-%m-%d",
                        }
                    },
                    "endDate": {

                        $dateToString: {
                            date: "$endInitDate",
                            format: "%Y-%m-%d",
                        }
                    },


                    "createdAt": {

                        $dateToString: {
                            date: "$createdAt",
                            format: "%Y-%m-%d",
                        }
                    },

                }
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: ["$time", "$startDate"] },

                            { $lte: ["$time", "$endDate"] },

                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "dateRange": {
                        "$range": [
                            0,
                            {
                                $add: [
                                    {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    "$endInitDate",
                                                    "$startInitDate"]
                                            },
                                            86400000
                                        ]
                                    },
                                    1
                                ]
                            }
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "dateRange": {
                        $map: {
                            input: "$dateRange",
                            as: "increment",
                            in: {
                                "$add": [
                                    "$startInitDate",
                                    {
                                        "$multiply": [
                                            "$$increment",
                                            86400000
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                "$unwind": "$dateRange"
            },
            {
                $addFields: {
                    "dateRange": {

                        $dateToString: {
                            date: "$dateRange",
                            format: "%Y-%m-%d",
                        }
                    },
                }
            },

            {
                $project: {
                    dateRange: 1,
                    time: 1,
                    amount: 1,
                    createdAt: 1,
                }
            },
            {
                $group: {
                    _id: "$dateRange",
                    time: { $first: "$dateRange" },
                    sale: { $sum: { $cond: [{ $eq: ["$dateRange", "$time"] }, "$amount", 0] } },
                }
            },
            { $sort: { _id: 1 } }
        ])
    }

    async getHomeSampleData(query: any, page: any, limit: any, skip: any): Promise<any> {

        let data = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'booking',
                    foreignField: '_id',
                    as: 'booking',
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$booking',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            {
                $lookup: {
                    from: 'businessDevelopmentOfficers',
                    localField: 'bdo',
                    foreignField: '_id',
                    as: 'bdo',
                },
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicle',
                    foreignField: '_id',
                    as: 'vehicle',
                },
            },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$vehicle',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$bdo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }],// add projection here wish you re-shape the docs
                    totalData: [{
                        $group: {
                            _id: "",
                            totalAmount: { $sum: "$amount" },
                        }
                    }]  // add projection here wish you re-shape the docs
                }
            }

        ]) as any;
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data
    }

    async getWalkInData(query: any, page: any, limit: any, skip: any): Promise<any> {

        let data = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            {
                $lookup: {
                    from: 'businessDevelopmentOfficers',
                    localField: 'bdo',
                    foreignField: '_id',
                    as: 'bdo',
                },
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'booking',
                    foreignField: '_id',
                    as: 'booking',
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$bdo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$booking',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }],
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ] // add projection here wish you re-shape the docs
                }
            }

        ]) as any;
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data
    }

    async getHomeSampleRev(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "vehicles",
                    let: { vehicle: "$vehicle" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$vehicle"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "vehicle"
                }
            },
            {
                $lookup: {
                    from: 'businessDevelopmentOfficers',
                    localField: 'bdo',
                    foreignField: '_id',
                    as: 'bdo',
                },
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'booking',
                    foreignField: '_id',
                    as: 'booking',
                },
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            {
                $unwind: {
                    path: '$booking',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$bdo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$vehicle',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }], // add projection here wish you re-shape the docs
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ] // add projection here wish you re-shape the docs
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data
    }

    async getVendorPayment(query: any, page: any, limit: any, skip: any): Promise<any> {

        let data = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }],// add projection here wish you re-shape the docs
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ]
                }
            }

        ]) as any;
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data
    }


    async getVehiclePaymentData(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicle',
                    foreignField: '_id',
                    as: 'vehicle',
                },
            },
            {
                $unwind: {
                    path: '$vehicle',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$booking',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }], // add projection here wish you re-shape the docs,
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ]
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data
    }

    async getBankPayment(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }], // add projection here wish you re-shape the docs
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ]
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data

    }


    async getLabPayments(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'labs',
                    localField: 'lab',
                    foreignField: '_id',
                    as: 'lab',
                },
            },
            {
                $unwind: {
                    path: '$lab',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }], // add projection here wish you re-shape the docs
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ]
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data

    }

    async getAdminPayments(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$financeAdmin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "financeAdmin"
                }
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$financeAdmin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }], // add projection here wish you re-shape the docs
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ]
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data

    }

    async getDepositePayments(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$financeAdmin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "financeAdmin"
                }
            },
            {
                $unwind: {
                    path: '$financeAdmin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }],// add projection here wish you re-shape the docs
                    totalData: [{
                        $group: {
                            _id: "",
                            totalAmount: { $sum: "$amount" },
                        }
                    }]
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        return data
    }

    async getCommissionPayment(query: any, page: any, limit: any, skip: any): Promise<any> {
        let data: any = await this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "admin",
                    let: { admin: "$admin" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$admin"] },
                            }
                        },
                        {
                            $project: {
                                password: 0
                            }
                        }
                    ],
                    as: "admin"
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendor',
                },
            },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) }], // add projection here wish you re-shape the docs
                    totalData: [
                        {
                            $group: {
                                _id: "",
                                totalAmount: { $sum: "$amount" },
                            }
                        }
                    ]
                }
            }

        ]);
        [data] = data;
        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }
        return data
    }

}

export default FinanceRepository