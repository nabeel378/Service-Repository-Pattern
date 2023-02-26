import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/booking.model"
import { inject, injectable } from "inversify";
import BookingDTO from "../../models/dto-models/booking.dto";
import IBookingRepository from "../interfaces/ibooking.repository";
import mongoose, { Types } from "mongoose";
import { CUSTOMER_TYPE } from "../../enums/appointment.enum";
import Partial from "../../utils/partial.type"
import { DownloadCSVBookingQuery, DownloadCSVAppointmentQuery, DownloadCSVAppointmentAggregation } from "../../models/dto-models/booking.downloadcsv.dto";
import SERVICE_IDENTIFIER from "../../../identifiers";
import IAppointmentRepository from "../interfaces/iappointment.repository";

@injectable()
class BookingRepository extends Repository<BookingDTO> implements IBookingRepository {
    @inject(SERVICE_IDENTIFIER.AppointmentRepository)
    appointmentRepository!: IAppointmentRepository;
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    subServiceUpdateForAppointmentMutiple(bookingId: string): Promise<any[]> {
        return this.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(bookingId),
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
                    from: "appointments",
                    let: { bookingId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$booking", "$$bookingId"],
                                },
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
                                localField: "subService",
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
                        {
                            $unwind: {
                                path: "$subService",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: "$vendor",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "services",
                                localField: "subService.service",
                                foreignField: "_id",
                                as: "subService.service",
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
                                path: "$subService.service",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
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
                                from: "cities",
                                localField: "branch.city",
                                foreignField: "_id",
                                as: "branch.city",
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
                        {
                            $unwind: {
                                path: "$branch.city",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: "appointments",
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
                    localField: "subService",
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
            {
                $unwind: {
                    path: "$subService",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$vendor",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "services",
                    localField: "subService.service",
                    foreignField: "_id",
                    as: "subService.service",
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
                    path: "$subService.service",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$slot",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$branch",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]) as Promise<any[]>
    }
    returnDataForConsentForm(bookingId: any): Promise<any> {
        return this.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(bookingId)
                }
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
                $unwind: {
                    path: '$zone',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: 'appointments',
                    let: { bookingId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$booking", "$$bookingId"],
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
                            $unwind: {
                                path: '$zone',
                                preserveNullAndEmptyArrays: true,
                            }
                        },
                        {
                            $lookup: {
                                from: 'branches',
                                localField: 'branch',
                                foreignField: '_id',
                                as: 'branch'
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
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
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
                            $lookup: {
                                from: 'subServices',
                                localField: 'subService',
                                foreignField: '_id',
                                as: 'subService'
                            }
                        },
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
                            $unwind: {
                                path: '$subService',
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
                            $lookup: {
                                from: 'services',
                                localField: 'subService.service',
                                foreignField: '_id',
                                as: 'subService.service'
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
                                path: '$subService.service',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$slot',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'branch.city',
                                foreignField: '_id',
                                as: 'branch.city'
                            }
                        },
                        {
                            $lookup: {
                                from: 'labs',
                                localField: 'lab',
                                foreignField: '_id',
                                as: 'lab'
                            }
                        },
                        {
                            $unwind: {
                                path: '$lab',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch.city',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'appointments',
                },
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branch'
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
                    from: 'slots',
                    localField: 'slot',
                    foreignField: '_id',
                    as: 'slot'
                }
            },
            {
                $lookup: {
                    from: 'subServices',
                    localField: 'subService',
                    foreignField: '_id',
                    as: 'subService'
                }
            },
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
                $unwind: {
                    path: '$subService',
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
                $lookup: {
                    from: 'services',
                    localField: 'subService.service',
                    foreignField: '_id',
                    as: 'subService.service'
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
                    path: '$subService.service',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$slot',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$branch',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ])

    }

    getBookingForConsentForm(bookingId: any): Promise<any[]> {
        return this.aggregate([
            {
                $match: {
                    _id: bookingId
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
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]) as any
    }

    getBookingsForVehicle(dataDTO: { _id: string, start: string | Date, end: string | Date }): Promise<any[]> {

        return this.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ['$vehicle', dataDTO._id] },
                            { $eq: ['$customerType', CUSTOMER_TYPE.HOME_SAMPLE] },
                            { $in: ['$status', status] },

                            { $gte: [{ $subtract: ["$appointmentTime", new Date("1970-01-01")] }, new Date(dataDTO.start).getTime()], },
                            { $lte: [{ $subtract: ["$appointmentTime", new Date("1970-01-01")] }, new Date(dataDTO.end).getTime()], },

                        ]
                    }
                }
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
                $unwind: {
                    path: '$zone',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: 'appointments',
                    let: { bookingId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$booking", "$$bookingId"],
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
                            $unwind: {
                                path: '$zone',
                                preserveNullAndEmptyArrays: true,
                            }
                        },
                        {
                            $lookup: {
                                from: 'branches',
                                localField: 'branch',
                                foreignField: '_id',
                                as: 'branch'
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
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
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
                            $lookup: {
                                from: 'subServices',
                                localField: 'subService',
                                foreignField: '_id',
                                as: 'subService'
                            }
                        },
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
                            $unwind: {
                                path: '$subService',
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
                            $lookup: {
                                from: 'services',
                                localField: 'subService.service',
                                foreignField: '_id',
                                as: 'subService.service'
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
                                path: '$subService.service',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$slot',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'branch.city',
                                foreignField: '_id',
                                as: 'branch.city'
                            }
                        },
                        {
                            $lookup: {
                                from: 'labs',
                                localField: 'lab',
                                foreignField: '_id',
                                as: 'lab'
                            }
                        },
                        {
                            $unwind: {
                                path: '$lab',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch.city',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'appointments',
                },
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branch'
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
                    from: 'slots',
                    localField: 'slot',
                    foreignField: '_id',
                    as: 'slot'
                }
            },
            {
                $lookup: {
                    from: 'subServices',
                    localField: 'subService',
                    foreignField: '_id',
                    as: 'subService'
                }
            },
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
                $unwind: {
                    path: '$subService',
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
                $lookup: {
                    from: 'services',
                    localField: 'subService.service',
                    foreignField: '_id',
                    as: 'subService.service'
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
                    path: '$subService.service',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$slot',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$branch',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    time: 1,
                    'slot.startTime': 1,
                }
            },
        ]
        ) as unknown as Promise<any[]>
    }

    getAllUnassignedForGodsEye(queryDTO: { start: string | Date, end: string | Date }): Promise<any[]> {

        return this.aggregate([
            {
                $match: {
                    vehicle: { $exists: false },
                    customerType: CUSTOMER_TYPE.HOME_SAMPLE,
                    time: {
                        $gte: new Date(queryDTO.start),
                        $lte: new Date(queryDTO.end),
                    },
                }
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
                $unwind: {
                    path: '$zone',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: 'subServices',
                    localField: 'subService',
                    foreignField: '_id',
                    as: 'subService'
                }
            },
            {
                $unwind: {
                    path: '$subService',
                    preserveNullAndEmptyArrays: true,
                }
            },
        ]) as Promise<any[]>
    }

    getBookingById(_id: string): Promise<any[]> {
        return this.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id)
                }
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
                $unwind: {
                    path: '$zone',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: 'appointments',
                    let: { bookingId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$booking", "$$bookingId"],
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
                            $unwind: {
                                path: '$zone',
                                preserveNullAndEmptyArrays: true,
                            }
                        },
                        {
                            $lookup: {
                                from: 'branches',
                                localField: 'branch',
                                foreignField: '_id',
                                as: 'branch'
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
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
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
                            $addFields: {
                                price: { $sum: "$subService.amount" },

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
                        // {
                        //     $unwind: {
                        //         path: '$subService',
                        //         preserveNullAndEmptyArrays: true,
                        //     },
                        // },
                        {
                            $unwind: {
                                path: '$vendor',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        // {
                        //     $lookup: {
                        //         from: 'services',
                        //         localField: 'subService.service',
                        //         foreignField: '_id',
                        //         as: 'subService.service'
                        //     }
                        // },
                        {
                            $unwind: {
                                path: '$vehicle',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        // {
                        //     $unwind: {
                        //         path: '$subService.service',
                        //         preserveNullAndEmptyArrays: true,
                        //     },
                        // },
                        {
                            $unwind: {
                                path: '$slot',
                                preserveNullAndEmptyArrays: true,
                            },
                        },

                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'branch.city',
                                foreignField: '_id',
                                as: 'branch.city'
                            }
                        },
                        {
                            $lookup: {
                                from: 'labs',
                                localField: 'lab',
                                foreignField: '_id',
                                as: 'lab'
                            }
                        },
                        {
                            $unwind: {
                                path: '$lab',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch.city',
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
                                path: "$cancelByVehicle",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: "$vehicle",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'appointments',
                },
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branch'
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
                    from: 'slots',
                    localField: 'slot',
                    foreignField: '_id',
                    as: 'slot'
                }
            },
            {
                $lookup: {
                    from: 'subServices',
                    localField: 'subService',
                    foreignField: '_id',
                    as: 'subService'
                }
            },
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
            // {
            //     $unwind: {
            //         path: '$subService',
            //         preserveNullAndEmptyArrays: true,
            //     },
            // },
            {
                $unwind: {
                    path: '$vendor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //     $lookup: {
            //         from: 'services',
            //         localField: 'subService.service',
            //         foreignField: '_id',
            //         as: 'subService.service'
            //     }
            // },
            {
                $unwind: {
                    path: '$vehicle',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //     $unwind: {
            //         path: '$subService.service',
            //         preserveNullAndEmptyArrays: true,
            //     },
            // },
            {
                $unwind: {
                    path: '$slot',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$branch',
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
                    path: "$cancelByVehicle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$vehicle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    subServicesName: "$appointments.subServicesName",

                }
            },

            {
                $addFields: {
                    // price:{$arrayElemAt:["$appointments.price",0]},
                    price: { $sum: [{ $arrayElemAt: ["$appointments.price", 0] }, { $multiply: [{ $divide: [{ $arrayElemAt: ["$appointments.price", 0] }, 100] }, "$vat"] }] },
                    subServicesName: {
                        $reduce: {
                            input: "$subServicesName",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] }
                        }
                    }
                }
            },
        ]) as Promise<any[]>
    }


    downloadCSV(bookingQuery: Partial<DownloadCSVBookingQuery>, appointmentQuery: Partial<DownloadCSVAppointmentQuery>): Promise<DownloadCSVAppointmentAggregation[]> {

        return this.aggregate([

            {
                $match: bookingQuery,
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
                $unwind: {
                    path: '$zone',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: 'appointments',
                    let: { bookingId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$booking", "$$bookingId"],

                                },
                                ...appointmentQuery
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
                            $unwind: {
                                path: '$zone',
                                preserveNullAndEmptyArrays: true,
                            }
                        },
                        {
                            $lookup: {
                                from: 'branches',
                                localField: 'branch',
                                foreignField: '_id',
                                as: 'branch'
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
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
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
                            $lookup: {
                                from: 'subServices',
                                localField: 'subService',
                                foreignField: '_id',
                                as: 'subService'
                            }
                        },
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
                            $unwind: {
                                path: '$subService',
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
                            $lookup: {
                                from: 'services',
                                localField: 'subService.service',
                                foreignField: '_id',
                                as: 'subService.service'
                            }
                        },
                        {
                            $lookup: {
                                from: 'bookings',
                                localField: 'booking',
                                foreignField: '_id',
                                as: 'booking'
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
                                path: '$booking',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$subService.service',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$slot',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'branch.city',
                                foreignField: '_id',
                                as: 'branch.city'
                            }
                        },
                        {
                            $lookup: {
                                from: 'labs',
                                localField: 'lab',
                                foreignField: '_id',
                                as: 'lab'
                            }
                        },
                        {
                            $unwind: {
                                path: '$lab',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: '$branch.city',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $sort: {
                                time: 1,
                                'slot.startTime': -1,
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
                                path: "$cancelByVehicle",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $unwind: {
                                path: "$vehicle",
                                preserveNullAndEmptyArrays: true,
                            },
                        },

                    ],
                    as: 'appointments',
                },
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
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branch'
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
                    from: 'slots',
                    localField: 'slot',
                    foreignField: '_id',
                    as: 'slot'
                }
            },
            {
                $lookup: {
                    from: 'subServices',
                    localField: 'subService',
                    foreignField: '_id',
                    as: 'subService'
                }
            },
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
                $unwind: {
                    path: '$subService',
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
                    path: '$admin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'subService.service',
                    foreignField: '_id',
                    as: 'subService.service'
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
                    path: '$subService.service',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$slot',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$branch',
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
                    path: "$cancelByVehicle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$vehicle",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    _id: -1,
                }
            },
        ]) as Promise<any[]>;
    }
    /**
     * @params {testIds} Array of ObjectId
     * @params {booking} objectId
     */
    async addSetTest(arg0: {
        bookingId: mongoose.Types.ObjectId, subServiceId: mongoose.Types.ObjectId[]
        , appointmentId: string
    }) {
        let test = await this.appointmentRepository.getAllTestByBooking(arg0.bookingId, arg0.appointmentId);
        test = test.map((item: string | number  | Buffer | Uint8Array | undefined) => new mongoose.Types.ObjectId(item))

        return this.updateOne({ _id: arg0.bookingId }, { $addToSet: { subService: { $each: [...arg0.subServiceId, ...test] } } })
    }

}

export default BookingRepository;