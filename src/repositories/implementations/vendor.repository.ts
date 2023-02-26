import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/vendor.model"
import { injectable } from "inversify";
import IVendorRepository from "../interfaces/ivendor.repository";
import VendorDTO from "../../models/dto-models/vendor.dto";
import mongoose from "mongoose";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";

@injectable()
class VendorRepository extends Repository<VendorDTO> implements IVendorRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    /**
     * @params {vendorId} ObjectId
     * @params {paymentType} String enum PAYMENT_TYPE
     * @parms {testIds} Array of ObjectId
     * @description get commission and price of tests
     */
    getComissionByVidAndTids(params: { vendorId: string, paymentType: string, testIds: mongoose.Types.ObjectId[] }): Promise<CommissionCalculateDTO[]> {
        const vendorId = new mongoose.Types.ObjectId(params.vendorId)
        return this.aggregate([
            {
                $addFields: {
                    paymentType: params.paymentType
                }
            },
            {
                $match: {
                    _id: vendorId
                }
            },

            {
                $addFields: {
                    subServicesOffered: {
                        $filter: {
                            input: "$subServicesOffered",
                            as: "item",
                            cond: { $in: ["$$item.subService", params.testIds] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalAmount: {
                        $sum: {
                            $map: {
                                input: "$subServicesOffered",
                                as: "item",
                                in: "$$item.price",
                            },
                        },
                    },
                    commissionPercentage: {
                        $filter: {
                            input: "$subServicesOffered",
                            as: "item",
                            cond: { $eq: ["$$item.commission.type", "PERCENTAGE"] }
                        }
                    },
                    commissionFixed: {
                        $filter: {
                            input: "$subServicesOffered",
                            as: "item",
                            cond: { $eq: ["$$item.commission.type", "FIXED"] }
                        }
                    },
                },
            },
            {
                $addFields: {
                    totalCommissionPercentage: {
                        $sum: {
                            $map: {
                                input: "$commissionPercentage",
                                as: "item",
                                in: { $multiply: [{ $divide: ["$$item.price", 100] }, "$$item.commission.value"] },
                            },
                        },
                    },
                    totalCommissionFixed: {
                        $sum: {
                            $map: {
                                input: "$commissionFixed",
                                as: "item",
                                in: "$$item.commission.value"
                            },
                        },
                    },
                }
            },
            { $unwind: "$subServicesOffered" },
            {
                $project: {
                    _id: 0,
                    totalCommissionPercentage: 1,
                    totalCommissionFixed: 1,
                    totalCommission: { $sum: ["$totalCommissionPercentage", "$totalCommissionFixed"] },
                    subServiceId: "$subServicesOffered.subService",
                    paymentType: "$paymentType",
                    commissionType: "$subServicesOffered.commission.type",
                    commissionValue: {
                        $cond: [
                            { $eq: ["$subServicesOffered.commission.type", "PERCENTAGE"] },
                            { $multiply: [{ $divide: ["$subServicesOffered.price", 100] }, "$subServicesOffered.commission.value"] },
                            "$subServicesOffered.commission.value"
                        ]
                    },
                    extraAmountIfNotCard: "$subServicesOffered.extraAmountIfNotCard",
                    amount: "$subServicesOffered.price",
                    totalAmount: 1
                }
            }
        ]) as unknown as Promise<CommissionCalculateDTO[]>
    };

    getAllVendor(query: Partial<VehicleDTO>, pagination: BaseQueryDTO): Promise<ListDTO<any[]>> {
        return this.aggregate([
            {
                $match: query
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
                $unwind: {
                    path: '$bdo',
                    preserveNullAndEmptyArrays: true,
                },
            }
        ], true, pagination) as unknown as Promise<ListDTO<any[]>>
    }

    getAllSubService(query: Object): Promise<any[]> {
        return this.aggregate([
            {
                $match: query
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
                $unwind: {
                    path: '$bdo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$subServicesOffered',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "subServices",
                    localField: "subServicesOffered.subService",
                    foreignField: "_id",
                    as: "subServicesOffered.subService"
                }
            },
            {
                $unwind: {
                    path: '$subServicesOffered.subService',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $project: {
                    subServicesOffered: {
                        subService: '$subServicesOffered.subService._id',
                        name: '$subServicesOffered.subService.name',
                        price: '$subServicesOffered.price',
                        commission: '$subServicesOffered.commission',
                        extraAmountIfNotCard: '$subServicesOffered.extraAmountIfNotCard'
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    subServicesOffered: {
                        $push: '$subServicesOffered'
                    },
                }
            },
            {
                $project: {
                    subService: 1,
                    name: 1,
                    price: 1,
                    commission: 1,
                    extraAmountIfNotCard: 1,
                    subServicesOffered: {
                        $filter: {
                            input: "$subServicesOffered",
                            as: "subService",
                            cond: {
                                $and: [
                                    { $ifNull: ["$$subService.subService", false], },
                                ]
                            }
                        }
                    },
                }
            }
        ]) as Promise<any[]>;
    }
}

export default VendorRepository