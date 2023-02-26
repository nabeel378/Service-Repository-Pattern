import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/lab.model"
import { injectable } from "inversify";
import labRepository from "../interfaces/ilab.repository";
import LabDTO from "../../models/dto-models/lab.dto";
import mongoose from "mongoose";
import Partial from "../../utils/partial.type";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";

@injectable()
class LabRepository extends Repository<LabDTO> implements labRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    async isLabTestOffered(arg0: { labIds: mongoose.Types.ObjectId[], testIds: mongoose.Types.ObjectId[] }): Promise<{ isValid: boolean, totalPrice: number }> {
        const result: any[] = await this.aggregate([
            {
                $match: {
                    $expr: { $in: ["$_id", arg0.labIds] }
                }
            },

            { $addFields: { testIds: arg0.testIds } },
            { $unwind: "$subServicesOffered" },

            {
                $match: {
                    $expr: { $in: ["$subServicesOffered.subService", "$testIds"] }
                }
            },

            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    price: { $sum: "$subServicesOffered.price" }
                }
            }
        ]) as unknown as any[]

        return { isValid: result.length > 0 && result[0].count == arg0.testIds.length, totalPrice: result.length > 0 ? result[0].price : 0 };
    }

    async getAllLab(query: Partial<LabDTO>, paginateOption: BaseQueryDTO): Promise<any[]> {
        return this.aggregate([
            {
                $match: query
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
                    name: 1,
                    totalAmountPaid: 1,
                    totalAmountEarned: 1,
                    subServicesOffered: {
                        subService: '$subServicesOffered.subService._id',
                        name: '$subServicesOffered.subService.name',
                        price: '$subServicesOffered.price',
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    totalAmountPaid: { $first: '$totalAmountPaid' },
                    totalAmountEarned: { $first: '$totalAmountEarned' },
                    subServicesOffered: {
                        $push: '$subServicesOffered'
                    },
                }
            },
            {
                $project: {
                    name: 1,
                    totalAmountPaid: 1,
                    totalAmountEarned: 1,
                    subServicesOffered: {
                        $filter: {
                            input: "$subServicesOffered",
                            as: "subService",
                            cond: {
                                $and: [
                                    { $ifNull: ["$$subService.subService", false], },
                                    // { $eq: ['$$subService.isHidden', true] }
                                ]
                            }
                        }
                    },
                }
            },
        ], true, { page: paginateOption.page, limit: paginateOption.limit }) as unknown as Promise<any[]>
    }


    async getAllLabSubService(query: Partial<LabDTO>): Promise<any[]> {
        return this.aggregate([
            {
                $match: query
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
                    subServicesOffered: {
                        $filter: {
                            input: "$subServicesOffered",
                            as: "subService",
                            cond: {
                                $and: [
                                    { $ifNull: ["$$subService.subService", false], },
                                    // { $eq: ['$$subService.isHidden', true] }
                                ]
                            }
                        }
                    },
                }
            }
        ]) as Promise<any[]>

    }
}

export default LabRepository