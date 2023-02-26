import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/slot.model"
import { injectable } from "inversify";
import ISlotRepository from "../interfaces/islot.repository";
import SlotDTO from "../../models/dto-models/slot.dto";
import { STATUS } from "../../enums/appointment.enum"
import AppointmentDTO from "../../models/dto-models/appointment.dto";

@injectable()
class SlotRepository extends Repository<SlotDTO> implements ISlotRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    getAvailableSlot(query: Partial<SlotDTO>, date: string, amount: number): Promise<any[]> {
        return this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "appointments",
                    let: { slotId: "$_id" },
                    as: 'appointments',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$slot", "$$slotId"] },
                                        {
                                            $or: [
                                                { $eq: ["$status", STATUS.BOOKED] },
                                                // { $eq: ["$vehicle", memberData._id] },
                                                {
                                                    $and: [
                                                        { $eq: ["$status", STATUS.PENDING] },
                                                        { $lt: [new Date().getTime(), { $subtract: ["$expiresAt", new Date("1970-01-01")] }] },
                                                    ],
                                                },
                                            ],
                                        },
                                        { $gte: [{ $subtract: ["$time", new Date("1970-01-01")] }, new Date(date).getTime()] },
                                        { $lte: [{ $subtract: ["$time", new Date("1970-01-01")] }, new Date(date).getTime()] },
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    startTime: 1,
                    endTime: 1,
                    counts: { $subtract: [amount, { $size: "$appointments" }] },
                    isAvailable: { $cond: [{ $lt: [{ $size: "$appointments" }, amount] }, true, false] },
                }
            },
            {
                $match: {
                    isAvailable: true,
                },
            },
            {
                $project: {
                    isAvailable: 0,
                }
            },
            {
                $sort: {
                    startTime: 1,
                }
            },
        ]) as Promise<any[]>
    }

    getSlotMultipleTest(query: Partial<SlotDTO>): Promise<any[]> {
        return this.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: "$startTime",
                    id: { $first: "$_id" },
                    startTime: { $first: "$startTime" },
                    endTime: { $first: "$endTime" },
                    duration: { $first: "$duration" },
                },
            },
            { $project: { _id: 0 } },
            { $addFields: { _id: "$id" } },
            {
                $sort: {
                    startTime: 1,
                },
            },
        ]) as Promise<any>;
    }

    getCalendorSlot(matchQuery:Partial<SlotDTO>,query:Object,appointmentQuery:Partial<AppointmentDTO>):Promise<any>{
        return this.aggregate([


            {
              $addFields: {
                startTimeFormat: { $dateToString: { format: "%H:%M:%S", date: "$startTime" } },
                startHour: { $dateToString: { format: "%H:%M", date: "$startTime" } },
                endTimeFormat: { $dateToString: { format: "%H:%M:%S", date: "$endTime" } },
              }
            },
      
            {
              $match: {
      
                $expr: matchQuery
      
              }
            },
      
      
      
            {
              $match: query
            },
            {
              $group: {
                _id: '$startTime',
                startTime: { $first: '$startTime' },
                endTime: { $first: '$endTime' },
                duration: { $first: '$duration' },
                startHour: { $first: '$startHour' },
                startTimeFormat: { $first: '$startTimeFormat' },
                endTimeFormat: { $first: '$endTimeFormat' },
              }
            },
      
            {
              $sort: {
                startHour: 1
              }
            },
            {
              $lookup: {
                from: 'bookings',
                as: 'bookings',
                let: { startTimeFormat: "$startTimeFormat", startTime: '$startTime', endTime: '$endTime', },
                pipeline: [
                  {
                    $addFields: {
                      timeFormat: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
                      startTimeFormatBook: { $dateToString: { format: "%H:%M:%S", date: "$startTime" } },
                      endTimeFormatBook: { $dateToString: { format: "%H:%M:%S", date: "$endTime" } },
      
                    }
                  },
                  {
                    $match: {
                      $expr: {
                        $eq: ["$startTimeFormatBook", "$$startTimeFormat"]
                        // $and: [
                        //     { $gte: [{ $subtract: ["$startTime", new Date("1970-01-01")] }, { $subtract: ["$$startTime", new Date("1970-01-01")] }] },
                        //     { $lte: [{ $subtract: ["$endTime", new Date("1970-01-01")] }, { $subtract: ["$$endTime", new Date("1970-01-01")] }] },
                        //     { $gte: [{ $subtract: ["$time", new Date("1970-01-01")] }, new Date(date).getTime()] },
                        //     { $lte: [{ $subtract: ["$time", new Date("1970-01-01")] }, new Date(date).getTime()] },
                        // ]
                      }
                    }
                  },
                  {
      
                    $match: {
                      ...appointmentQuery,
                    },
      
      
                  },
                  // {
                  //     $lookup: {
                  //         from: 'zones',
                  //         localField: 'zone',
                  //         foreignField: '_id',
                  //         as: 'zone'
                  //     }
                  // },
                  // // {
                  // //     $lookup: {
                  // //         from: 'appointments',
                  // //         let: { bookingId: '$_id' },
                  // //         pipeline: [
                  // //             {
                  // //                 $match: {
                  // //                     $expr: {
                  // //                         $eq: ["$booking", "$$bookingId"],
                  // //                     },
                  // //                 },
                  // //             },
                  // //             // {
                  // //             //     $match:{
                  // //             //         ...appointmentQuery,
                  // //             //     },
      
                  // //             // },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'zones',
                  // //                     localField: 'zone',
                  // //                     foreignField: '_id',
                  // //                     as: 'zone'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$zone',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'branches',
                  // //                     localField: 'branch',
                  // //                     foreignField: '_id',
                  // //                     as: 'branch'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'staffMembers',
                  // //                     localField: 'members',
                  // //                     foreignField: '_id',
                  // //                     as: 'members'
                  // //                 }
                  // //             },
      
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'users',
                  // //                     localField: 'user',
                  // //                     foreignField: '_id',
                  // //                     as: 'user'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'slots',
                  // //                     localField: 'slot',
                  // //                     foreignField: '_id',
                  // //                     as: 'slot'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'subServices',
                  // //                     localField: 'subService',
                  // //                     foreignField: '_id',
                  // //                     as: 'subService'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'vehicles',
                  // //                     localField: 'vehicle',
                  // //                     foreignField: '_id',
                  // //                     as: 'vehicle'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'vendors',
                  // //                     localField: 'vendor',
                  // //                     foreignField: '_id',
                  // //                     as: 'vendor'
                  // //                 }
                  // //             },
                  // //             // {
                  // //             //     $unwind: {
                  // //             //         path: '$subService',
                  // //             //         preserveNullAndEmptyArrays: true,
                  // //             //     },
                  // //             // },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$vendor',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //             // {
                  // //             //     $lookup: {
                  // //             //         from: 'services',
                  // //             //         localField: 'subService.service',
                  // //             //         foreignField: '_id',
                  // //             //         as: 'subService.service'
                  // //             //     }
                  // //             // },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$vehicle',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //             // {
                  // //             //     $unwind: {
                  // //             //         path: '$subService.service',
                  // //             //         preserveNullAndEmptyArrays: true,
                  // //             //     },
                  // //             // },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$slot',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$user',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$branch',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'cities',
                  // //                     localField: 'branch.city',
                  // //                     foreignField: '_id',
                  // //                     as: 'branch.city'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $lookup: {
                  // //                     from: 'labs',
                  // //                     localField: 'lab',
                  // //                     foreignField: '_id',
                  // //                     as: 'lab'
                  // //                 }
                  // //             },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$lab',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //             {
                  // //                 $unwind: {
                  // //                     path: '$branch.city',
                  // //                     preserveNullAndEmptyArrays: true,
                  // //                 },
                  // //             },
                  // //         ],
                  // //         as: 'appointments',
                  // //     },
                  // // },
                  // {
                  //     $unwind: {
                  //         path: '$zone',
                  //         preserveNullAndEmptyArrays: true,
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'branches',
                  //         localField: 'branch',
                  //         foreignField: '_id',
                  //         as: 'branch'
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'regions',
                  //         localField: 'region',
                  //         foreignField: '_id',
                  //         as: 'region'
                  //     }
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$region',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'staffMembers',
                  //         localField: 'members',
                  //         foreignField: '_id',
                  //         as: 'members'
                  //     }
                  // },
      
                  // {
                  //     $lookup: {
                  //         from: 'users',
                  //         localField: 'user',
                  //         foreignField: '_id',
                  //         as: 'user'
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'slots',
                  //         localField: 'slot',
                  //         foreignField: '_id',
                  //         as: 'slot'
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //       from: "subServices",
                  //       localField: "subService",
                  //       foreignField: "_id",
                  //       as: "subService",
                  //     },
                  //   },
                  // {
                  //     $lookup: {
                  //         from: 'vehicles',
                  //         localField: 'vehicle',
                  //         foreignField: '_id',
                  //         as: 'vehicle'
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'vendors',
                  //         localField: 'vendor',
                  //         foreignField: '_id',
                  //         as: 'vendor'
                  //     }
                  // },
                  // // {
                  // //     $unwind: {
                  // //         path: '$subService',
                  // //         preserveNullAndEmptyArrays: true,
                  // //     },
                  // // },
                  // {
                  //     $unwind: {
                  //         path: '$vendor',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // // {
                  // //     $lookup: {
                  // //         from: 'services',
                  // //         localField: 'subService.service',
                  // //         foreignField: '_id',
                  // //         as: 'subService.service'
                  // //     }
                  // // },
                  // {
                  //     $unwind: {
                  //         path: '$vehicle',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // // {
                  // //     $unwind: {
                  // //         path: '$subService.service',
                  // //         preserveNullAndEmptyArrays: true,
                  // //     },
                  // // },
                  // {
                  //     $unwind: {
                  //         path: '$slot',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$user',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$branch',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'cities',
                  //         localField: 'branch.city',
                  //         foreignField: '_id',
                  //         as: 'branch.city'
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //         from: 'labs',
                  //         localField: 'lab',
                  //         foreignField: '_id',
                  //         as: 'lab'
                  //     }
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$lab',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$branch.city',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$remarks',
                  //         preserveNullAndEmptyArrays: true,
                  //     },
                  // },
                  // {
                  //     $lookup: {
                  //         from: "admin",
                  //         let: { admin: "$remarks.admin" },
                  //         pipeline: [
                  //             {
                  //                 $match: {
                  //                     $expr: { $eq: ["$_id", "$$admin"] },
                  //                 }
                  //             },
                  //             {
                  //                 $project: {
                  //                     password: 0
                  //                 }
                  //             }
                  //         ],
                  //         as: "remarks.admin"
                  //     }
                  // },
                  // {
                  //     $lookup: {
                  //         from: "vehicles",
                  //         let: { admin: "$remarks.vehicle" },
                  //         pipeline: [
                  //             {
                  //                 $match: {
                  //                     $expr: { $eq: ["$_id", "$$admin"] },
                  //                 }
                  //             },
                  //             {
                  //                 $project: {
                  //                     password: 0
                  //                 }
                  //             }
                  //         ],
                  //         as: "remarks.vehicle"
                  //     }
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$remarks.vehicle',
                  //         preserveNullAndEmptyArrays: true,
                  //     }
                  // },
                  // {
                  //     $unwind: {
                  //         path: '$remarks.admin',
                  //         preserveNullAndEmptyArrays: true,
                  //     }
                  // },
                  {
                    $group: {
                      _id: '$_id',
                      // endTimeFormatBook: { $first: "$endTimeFormatBook" },
                      // startTimeFormatBook: { $first: "$startTimeFormatBook" },
                      // bdo: { $first: "$bdo" },
                      // members: { $first: "$members" },
                      // lat: { $first: "$lat" },
                      // lng: { $first: "$lng" },
                      status: { $first: "$status" },
                      firstName: { $first: "$firstName" },
                      time: { $first: "$time" },
                      timeFormat: { $first: "$timeFormat" },
                      startTimeFormatBook: { $first: "$startTimeFormatBook" },
                      startTimeFormat: { $first: "$$startTimeFormat" },
                      // branch: { $first: "$branch" },
                      // noOfAppointments: { $first: "$noOfAppointments" },
                      // email: { $first: "$email" },
                      // phone: { $first: "$phone" },
                      // address: { $first: "$address" },
                      // addressTwo: { $first: "$addressTwo" },
                      // vendor: { $first: "$vendor" },
                      // vendorId: { $first: "$vendorId" },
                      // time: { $first: "$time" },
                      // zone: { $first: "$zone" },
                      // slot: { $first: "$slot" },
                      // startTime: { $first: "$startTime" },
                      // endTime: { $first: "$endTime" },
                      // subService: { $first: "$subService" },
                      // customerType: { $first: "$customerType" },
                      // vat: { $first: "$vat" },
                      // price: { $first: "$price" },
                      // password: { $first: "$password" },
                      // initialSubServices: { $first: "$initialSubServices" },
                      // initialPaymentType: { $first: "$initialPaymentType" },
                      bookingId: { $first: "$bookingId" },
                      // vehicle: { $first: "$vehicle" },
                      // region: { $first: "$region" },
                      // admin: { $first: "$admin" },
                      // appointments: { $first: "$appointments" },
                      // remarks: {
                      //     $push: '$remarks'
                      // },
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      // bdo: 1,
                      // endTimeFormatBook: 1,
                      // startTimeFormatBook: 1,
                      // members: 1,
                      // lat: 1,
                      // lng: 1,
                      startTimeFormatBook: 1,
                      status: 1,
                      timeFormat: 1,
                      startTimeFormat: 1,
                      time: 1,
                      firstName: 1,
                      // branch: 1,
                      // noOfAppointments: 1,
                      // email: 1,
                      // phone: 1,
                      // address: 1,
                      // addressTwo: 1,
                      // vendor: 1,
                      // vendorId: 1,
                      // time: 1,
                      // zone: 1,
                      // slot: 1,
                      // startTime: 1,
                      // endTime: 1,
                      // subService: 1,
                      // customerType: 1,
                      // vat: 1,
                      // price: 1,
                      // password: 1,
                      // initialSubServices: 1,
                      // initialPaymentType: 1,
                      bookingId: 1,
                      // vehicle: 1,
                      // region: 1,
                      // admin: 1,
                      // appointments: 1,
                      // remarks: {
                      //     $filter: {
                      //         input: "$remarks",
                      //         as: "remark",
                      //         cond: {
                      //             $and: [
                      //                 { $ifNull: ["$$remark.remarks", false], },
                      //             ]
                      //         }
                      //     }
                      // },
                    }
                  },
      
                ]
              }
            }
      
          ])
    }
}

export default SlotRepository