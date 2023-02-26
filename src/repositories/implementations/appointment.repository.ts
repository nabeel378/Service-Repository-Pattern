import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/appointment.model"
import { injectable } from "inversify";
import AppointmentDTO from "../../models/dto-models/appointment.dto";
import IAppointmentRepository from "../interfaces/iappointment.repository";
import ListDTO from "../../models/dto-models/list.dto";
import mongoose from "mongoose";
import { STATUS, CUSTOMER_TYPE } from "../../enums/appointment.enum";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
@injectable()
class AppointmentRepository extends Repository<AppointmentDTO> implements IAppointmentRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    getAllAppointmentWithBooking(appointmentQuery: {}, page: string | number, limit: string | number, skip: string | number): Promise<ListDTO<unknown>> {
        return this.aggregate([
            {
                $match: appointmentQuery
            },
            {
                $group: {
                    _id: '$bookingId',
                    bookingId: { $first: '$bookingId' },
                    booking_id: { $first: '$_id' },
                }
            },
            { $sort: { booking_id: -1, } },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) },
                    {
                        $lookup: {
                            from: 'appointments',
                            let: { bookingId: '$bookingId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$bookingId", "$$bookingId"],

                                        },
                                        ...appointmentQuery
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'users',
                                        localField: 'user',
                                        foreignField: '_id',
                                        as: 'user'
                                    }
                                },
                                {
                                    $addFields: {
                                        price: { $sum: "$subService.amount" },
                                        // price:{$sum:[{$sum:"$subService.amount"},{$multiply:[{$divide:[ {$sum:"$subService.amount"} ,100]},"$vat"]}]},

                                        // originalVat:{$sum:"$vat"},
                                        // vendor:{$arrayElemAt:["$vendor._id",0]}
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'subServices',
                                        localField: 'subService.subServiceId',
                                        foreignField: '_id',
                                        as: 'subService'
                                    }
                                },
                                {
                                    $addFields: {
                                        subServicesName: "$subService.name"
                                    }
                                },
                                // {
                                //     $unwind: {
                                //         path: '$subService',
                                //         preserveNullAndEmptyArrays: true,
                                //     },
                                // },
                                {
                                    $unwind: {
                                        path: '$user',
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'admin',
                                        localField: 'cancelBy',
                                        foreignField: '_id',
                                        as: 'cancelByAdmin'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$admin",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$cancelByAdmin",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'vehicles',
                                        localField: 'cancelBy',
                                        foreignField: '_id',
                                        as: 'cancelByVehicle'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$vehicle',
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$cancelByVehicle",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                // {
                                //     $unwind: {
                                //         path: '$remarks',
                                //         preserveNullAndEmptyArrays: true,
                                //     },
                                // },
                                {
                                    $lookup: {
                                        from: "admin",
                                        let: { admin: "$remarks.admin" },
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
                                        as: "remarks.admin"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "vehicles",
                                        let: { admin: "$remarks.vehicle" },
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
                                        as: "remarks.vehicle"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$remarks.admin',
                                        preserveNullAndEmptyArrays: true,
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$remarks.vehicle',
                                        preserveNullAndEmptyArrays: true,
                                    }
                                },
                                {
                                    $project: {
                                        members: 0,
                                    }
                                },
                            ],
                            as: 'children',
                        },
                    },
                    {
                        $lookup: {
                            from: 'bookings',
                            let: { bookingId: '$bookingId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$bookingId", "$$bookingId"],

                                        },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'zones',
                                        localField: 'zone',
                                        foreignField: '_id',
                                        as: 'zone'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'slots',
                                        localField: 'slot',
                                        foreignField: '_id',
                                        as: 'slot'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$slot',
                                        preserveNullAndEmptyArrays: true,
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$zone',
                                        preserveNullAndEmptyArrays: true,
                                    }
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
                                        from: 'staffMembers',
                                        localField: 'members',
                                        foreignField: '_id',
                                        as: 'members'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'subServices',
                                        localField: 'subService.subServiceId',
                                        foreignField: '_id',
                                        as: 'subService'
                                    }
                                },
                                // {$addFields:{
                                //     subServicesName:"$subService.name"
                                // }},
                                {
                                    $lookup: {
                                        from: 'vehicles',
                                        localField: 'vehicle',
                                        foreignField: '_id',
                                        as: 'vehicle'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'vendors',
                                        localField: 'vendor',
                                        foreignField: '_id',
                                        as: 'vendor'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'regions',
                                        localField: 'region',
                                        foreignField: '_id',
                                        as: 'region'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'businessDevelopmentOfficers',
                                        localField: 'bdo',
                                        foreignField: '_id',
                                        as: 'bdo'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'admin',
                                        localField: 'cancelBy',
                                        foreignField: '_id',
                                        as: 'cancelByAdmin'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$admin",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$cancelByAdmin",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'vehicles',
                                        localField: 'cancelBy',
                                        foreignField: '_id',
                                        as: 'cancelByVehicle'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$vehicle',
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$cancelByVehicle",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $unwind: {
                                        path: '$region',
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
                                        path: '$vendor',
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                // {
                                //     $unwind: {
                                //         path: '$subService',
                                //         preserveNullAndEmptyArrays: true,
                                //     },
                                // },
                                {
                                    $unwind: {
                                        path: '$admin',
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
                                        path: '$remarks',
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $lookup: {
                                        from: "admin",
                                        let: { admin: "$remarks.admin" },
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
                                        as: "remarks.admin"
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "vehicles",
                                        let: { admin: "$remarks.vehicle" },
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
                                        as: "remarks.vehicle"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$remarks.vehicle',
                                        preserveNullAndEmptyArrays: true,
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$remarks.admin',
                                        preserveNullAndEmptyArrays: true,
                                    }
                                },
                                {
                                    $group: {
                                        _id: '$_id',
                                        bdo: { $first: "$bdo" },
                                        members: { $first: "$members" },
                                        lat: { $first: "$lat" },
                                        lng: { $first: "$lng" },
                                        status: { $first: "$status" },
                                        firstName: { $first: "$firstName" },
                                        branch: { $first: "$branch" },
                                        extraAmountIfNotCard: { $first: "$extraAmountIfNotCard" },
                                        noOfAppointments: { $first: "$noOfAppointments" },
                                        email: { $first: "$email" },
                                        phone: { $first: "$phone" },
                                        address: { $first: "$address" },
                                        addressTwo: { $first: "$addressTwo" },
                                        vendor: { $first: "$vendor" },
                                        vendorId: { $first: "$vendorId" },
                                        time: { $first: "$time" },
                                        zone: { $first: "$zone" },
                                        subServicesName: { $first: "$subServicesName" },

                                        slot: { $first: "$slot" },
                                        startTime: { $first: "$startTime" },
                                        endTime: { $first: "$endTime" },
                                        subService: { $first: "$subService" },
                                        customerType: { $first: "$customerType" },
                                        vat: { $first: "$vat" },
                                        price: { $first: "$price" },
                                        password: { $first: "$password" },
                                        initialSubServices: { $first: "$initialSubServices" },
                                        initialPaymentType: { $first: "$initialPaymentType" },
                                        bookingId: { $first: "$bookingId" },
                                        vehicle: { $first: "$vehicle" },
                                        region: { $first: "$region" },
                                        cancelByAdmin: { $first: "$cancelByAdmin" },
                                        cancelByVehicle: { $first: "$cancelByVehicle" },
                                        admin: { $first: "$admin" },
                                        remarks: {
                                            $push: '$remarks',
                                        },
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        bdo: 1,
                                        members: 1,
                                        lat: 1,
                                        lng: 1,
                                        status: 1,
                                        firstName: 1,
                                        branch: 1,
                                        noOfAppointments: 1,
                                        email: 1,
                                        phone: 1,
                                        address: 1,
                                        addressTwo: 1,
                                        vendor: 1,
                                        vendorId: 1,
                                        time: 1,
                                        zone: 1,
                                        slot: 1,
                                        startTime: 1,
                                        endTime: 1,
                                        subService: 1,
                                        customerType: 1,
                                        vat: 1,
                                        price: 1,
                                        password: 1,
                                        initialSubServices: 1,
                                        initialPaymentType: 1,
                                        bookingId: 1,
                                        vehicle: 1,
                                        region: 1,
                                        admin: 1,
                                        cancelBy: 1,
                                        cancelByAdmin: 1,
                                        cancelByVehicle: 1,
                                        extraAmountIfNotCard: 1,
                                        remarks: {
                                            $filter: {
                                                input: "$remarks",
                                                as: "remark",
                                                cond: {
                                                    $and: [
                                                        { $ifNull: ["$$remark.remarks", false], },
                                                    ]
                                                }
                                            }
                                        },
                                    }
                                },
                                {
                                    $addFields: {
                                        isBooking: true
                                    }
                                },

                            ],
                            as: 'booking',
                        },
                    },
                    {
                        $unwind: {
                            path: '$booking',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                    {
                        $lookup: {
                            from: 'admin',
                            localField: 'cancelBy',
                            foreignField: '_id',
                            as: 'cancelByAdmin'
                        }
                    },
                    {
                        $unwind: {
                            path: "$admin",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: "$cancelByAdmin",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'vehicles',
                            localField: 'cancelBy',
                            foreignField: '_id',
                            as: 'cancelByVehicle'
                        }
                    },
                    {
                        $unwind: {
                            path: '$vehicle',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: "$cancelByVehicle",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: '$remarks',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "admin",
                            let: { admin: "$remarks.admin" },
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
                            as: "remarks.admin"
                        }
                    },
                    {
                        $lookup: {
                            from: "vehicles",
                            let: { admin: "$remarks.vehicle" },
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
                            as: "remarks.vehicle"
                        }
                    },
                    {
                        $unwind: {
                            path: '$remarks.vehicle',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                    {
                        $unwind: {
                            path: '$remarks.admin',
                            preserveNullAndEmptyArrays: true,
                        }
                    },
                    {
                        $addFields: {
                            isAvailable: { $cond: [{ $gte: [{ $size: "$children" }, 1] }, true, false] },
                        }
                    },
                    {
                        $match: {
                            isAvailable: true,
                        },
                    },
                    {
                        $project: {
                            _id: "$booking._id",
                            members: "$booking.members",
                            lat: "$booking.lat",
                            lng: "$booking.lng",
                            status: "$booking.status",
                            firstName: "$booking.firstName",
                            branch: "$booking.branch",
                            noOfAppointments: "$booking.noOfAppointments",
                            email: "$booking.email",
                            phone: "$booking.phone",
                            address: "$booking.address",
                            addressTwo: "$booking.addressTwo",
                            vendor: "$booking.vendor",
                            vendorId: "$booking.vendorId",
                            time: "$booking.time",
                            zone: "$booking.zone",
                            slot: "$booking.slot",
                            startTime: "$booking.startTime",
                            endTime: "$booking.endTime",
                            subService: "$booking.subService",
                            customerType: "$booking.customerType",
                            vat: "$booking.vat",
                            discountAmount: { $multiply: [{ $divide: [{ $sum: "$children.price" }, 100] }, { $arrayElemAt: ["$children.discount", 0] }] },
                            data: { $multiply: [{ $divide: [{ $sum: "$children.price" }, 100] }, { $arrayElemAt: ["$children.discount", 0] }] },
                            price: { $subtract: [{ $sum: "$children.price" }, { $multiply: [{ $divide: [{ $sum: "$children.price" }, 100] }, { $arrayElemAt: ["$children.discount", 0] }] }] },
                            // price:{$subtract:[{$sum:[{ $sum: "$children.price" },{$multiply:[{$divide:[{ $sum: "$children.price" },100]},"$booking.vat"]}] }  ]},
                            discount: { $arrayElemAt: ["$children.discount", 0] },
                            password: "$booking.password",
                            initialSubServices: "$booking.initialSubServices",
                            initialPaymentType: "$booking.initialPaymentType",
                            bookingId: "$booking.bookingId",
                            remarks: "$booking.remarks",
                            vehicle: "$booking.vehicle",
                            region: "$booking.region",
                            admin: "$booking.admin",
                            cancelByAdmin: "$booking.cancelByAdmin",
                            cancelByVehicle: "$booking.cancelByVehicle",
                            subServicesName: {
                                $reduce: {
                                    input: "$children.subService.name",
                                    initialValue: [],
                                    in: { $concatArrays: ['$$value', '$$this'] }
                                }
                            },
                            children: "$children",
                            extraAmountIfNotCard: "$booking.extraAmountIfNotCard",
                            isBooking: "$booking.isBooking",
                            bdo: "$booking.bdo",
                        }
                    },
                    {
                        $addFields: {
                            price: { $sum: ["$price", { $multiply: [{ $divide: ["$price", 100] }, "$vat"] }] },
                        }
                    }
                    ] // add projection here wish you re-shape the docs
                }
            },
            // {

        ]) as Promise<ListDTO<unknown>>;
    }

    async getAllTestByBooking(booking: any, appointmentId: any): Promise<any[]> {
        let result = await this.aggregate([

            { $match: { booking: booking } },
            { $match: { _id: { $ne: appointmentId } } },

            {
                $group: {
                    _id: null,
                    subService: { $addToSet: "$subService.subServiceId" }
                }
            },

            {
                $addFields: {
                    subService: {
                        $reduce: {
                            input: "$subService",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    subService: { $setUnion: "$subService" }
                }
            }
        ]) as any[]

        if (result.length > 0) {
            return result[0].subService
        }
        return []
    }

    async updateTest(arg0: { paymentTypes: { amount: string | number }[], appointmentId: string, subService: CommissionCalculateDTO[] }): Promise<any> {
        let payment = arg0.paymentTypes[arg0.paymentTypes.length - 1].amount

        const result = await this.update({ _id: new mongoose.Types.ObjectId(arg0.appointmentId) }, { $set: { price: payment, paymentTypes: arg0.paymentTypes, subService: arg0.subService } });
        return result
    }

    gitSingleAppointment(_id: string): Promise<any[]> {

        return this.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: "zones",
                    localField: "zone",
                    foreignField: "_id",
                    as: "zone",
                },
            },
            {
                $unwind: {
                    path: "$zone",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "branches",
                    localField: "branch",
                    foreignField: "_id",
                    as: "branch",
                },
            },
            {
                $lookup: {
                    from: "staffMembers",
                    localField: "members",
                    foreignField: "_id",
                    as: "members",
                },
            },
            {
                $addFields: {
                    priceDiscount: { $subtract: [{ $sum: "$subService.amount" }, { $multiply: [{ $divide: [{ $sum: "$subService.amount" }, 100] }, "$discount"] }] }
                }
            },
            {
                $addFields: {
                    price: { $sum: ["$priceDiscount", { $multiply: [{ $divide: ["$priceDiscount", 100] }, "$vat"] }] },

                    // originalVat:{$sum:"$vat"},
                    // vendor:{$arrayElemAt:["$vendor._id",0]}
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $lookup: {
                    from: "slots",
                    localField: "slot",
                    foreignField: "_id",
                    as: "slot",
                },
            },
            {
                $lookup: {
                    from: "subServices",
                    localField: "subService.subServiceId",
                    foreignField: "_id",
                    as: "subService",
                },
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle",
                    foreignField: "_id",
                    as: "vehicle",
                },
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "vendor",
                    foreignField: "_id",
                    as: "vendor",
                },
            },
            // {
            //   $unwind: {
            //     path: "$subService",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
                $unwind: {
                    path: "$vendor",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //   $lookup: {
            //     from: "services",
            //     localField: "subService.service",
            //     foreignField: "_id",
            //     as: "subService.service",
            //   },
            // },
            {
                $lookup: {
                    from: "bookings",
                    localField: "booking",
                    foreignField: "_id",
                    as: "booking",
                },
            },
            {
                $unwind: {
                    path: "$vehicle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$booking",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //   $unwind: {
            //     path: "$subService.service",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
                $unwind: {
                    path: "$slot",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$branch",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "labs",
                    localField: "lab",
                    foreignField: "_id",
                    as: "lab",
                },
            },
            {
                $unwind: {
                    path: "$lab",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]) as Promise<any[]>
    }

    /**
 * 
 * @param {*} filterDate example 2022-04   e.g year-month
 * @returns 
 */
    getSummary(filterDate: Date | string): Promise<any[]> {
        return this.aggregate([
            {
                $addFields: {
                    filterDate: {
                        $dateToString: {
                            date: "$time",
                            format: "%Y-%m",
                        }
                    }
                }
            },
            { $match: { "filterDate": filterDate } },
            {
                $match: {
                    isHidden: false,
                    status: { $nin: [STATUS.PENDING] },
                },
            },
            {
                $group: {
                    _id: 1,
                    completed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.COMPLETED] },
                                1,
                                0,
                            ],
                        },
                    },
                    cancelled: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.CANCELLED] },
                                1,
                                0,
                            ],
                        },
                    },
                    booked: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.BOOKED] },
                                1,
                                0,
                            ],
                        },
                    },
                    sampleCollected: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        STATUS.SAMPLE_COLLECTED,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    enRoute: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.EN_ROUTE] },
                                1,
                                0,
                            ],
                        },
                    },
                    arrived: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.ARRIVED] },
                                1,
                                0,
                            ],
                        },
                    },
                    sentToLab: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.SENT_TO_LAB] },
                                1,
                                0,
                            ],
                        },
                    },
                    batchDone: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", STATUS.BATCH_DONE] },
                                1,
                                0,
                            ],
                        },
                    },
                    walkInSample: {
                        $sum: {
                            $cond: [{ $eq: ["$customerType", CUSTOMER_TYPE.WALK_IN] }, 1, 0]
                        }
                    },
                    homeSample: {
                        $sum: {
                            $cond: [{ $eq: ["$customerType", CUSTOMER_TYPE.HOME_SAMPLE] }, 1, 0]
                        }
                    },
                    total: { $sum: 1 },
                },
            },
            {
                $project: {
                    completed: { $ifNull: ["$completed", 0] },
                    cancelled: { $ifNull: ["$cancelled", 0] },
                    booked: { $ifNull: ["$booked", 0] },
                    sampleCollected: { $ifNull: ["$sampleCollected", 0] },
                    enRoute: { $ifNull: ["$enRoute", 0] },
                    arrived: { $ifNull: ["$arrived", 0] },
                    sentToLab: { $ifNull: ["$sentToLab", 0] },
                    batchDone: { $ifNull: ["$batchDone", 0] },
                    walkInSample: { $ifNull: ['$walkInSample', 0] },
                    homeSample: { $ifNull: ['$homeSample', 0] },
                    total: { $ifNull: ["$total", 0] },
                },
            },
        ]) as unknown as Promise<any[]>;
    }
}

export default AppointmentRepository