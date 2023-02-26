import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/vehicle.model"
import { injectable } from "inversify";
import IVehicleRepository from "../interfaces/ivehicle.repository";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import mongoose from "mongoose";

@injectable()
class VehicleRepository extends Repository<VehicleDTO> implements IVehicleRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    getAllVehicle(query: Partial<VehicleDTO>, start: Date | string, end: Date | string, baseQuery: BaseQueryDTO): any {
        return this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'bookings',
                    let: { vehicleId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$vehicle', '$$vehicleId'] },
                                        { $gte: ['$time', start] },
                                        { $lte: ['$time', end] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'subServices',
                                let: { subServiceId: '$subService' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$subServiceId"],
                                            }
                                        }
                                    },
                                ],
                                as: 'subService',
                            },
                        },
                        {
                            $lookup: {
                                from: 'zones',
                                let: { zoneId: '$zone' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$zoneId"],
                                            }
                                        }
                                    },
                                ],
                                as: 'zone',
                            },
                        },
                        {
                            $unwind: {
                                path: '$subService',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$zone',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'bookings'
                }
            },
            {
                $group: {
                    _id: "$_id",
                    firstName: { $first: "$firstName" },
                    lastName: { $first: "$lastName" },
                    phone: { $first: "$phone" },
                    email: { $first: "$email" },
                    gender: { $first: "$gender" },
                    dob: { $first: "$dob" },
                    status: { $first: "$status" },
                    location: { $first: "$location" },
                    isAvailable: { $first: "$isAvailable" },
                    totalAvailableAmount: { $first: "$totalAvailableAmount" },
                    totalReceivedAmount: { $first: "$totalReceivedAmount" },
                    bookings: { $first: "$bookings" },
                    // appointments: { $push: "$appointments" },
                }
            },
            {
                $sort: {
                    createdAt: 1,
                }
            }
        ], true, baseQuery)
    }

    getVehicleById(_id: string): Promise<VehicleDTO[]> {
        return this.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id)
                }
            },

        ]) as Promise<VehicleDTO[]>
    }
    getAllStaffForVehicle(): Promise<any[]> {
        return this.aggregate([
            {
                $unwind: {
                    path: '$members',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]) as Promise<any[]>
    }
}

export default VehicleRepository