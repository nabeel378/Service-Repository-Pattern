import { inject, injectable } from "inversify";
import moment from "moment";
import mongoose from "mongoose";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { SHIFT, SHIFT_TIME, STATUS } from "../../enums/slot.enum";
import SlotDTO from "../../models/dto-models/slot.dto";
import IBranchRepository from "../../repositories/interfaces/ibranch.repository";
import ISlotRepository from "../../repositories/interfaces/islot.repository";
import ISubServiceRepository from "../../repositories/interfaces/isubservice.repository";
import { ResponseModel } from "../../utils/responsemodel";
import ISlotService from "../interfaces/islot.service";

@injectable()
class SlotService implements ISlotService {
  constructor(
    @inject(SERVICE_IDENTIFIER.SlotRepository) private slotRepository: ISlotRepository,
    @inject(SERVICE_IDENTIFIER.SubServiceRepository) private subServiceRepository: ISubServiceRepository,
    @inject(SERVICE_IDENTIFIER.BranchRepository) private branchRepository: IBranchRepository,
  ) { }


  async getAvailableSlots(obj: { subServiceData: any; type: any; date: any; }) {
    // let testDetailsBranch = branchData.testOffered.find((a) => String(a.test) == String(test))
    // let branchData = await Branch.findOne({ _id: SubServiceData.branch })
    let {
      subServiceData,
      type,
      date,
      // zone
    } = obj

    let branchData = await this.branchRepository.findOne({});

    let amount = Number.MAX_SAFE_INTEGER

    let currentTime = new Date()
    currentTime.setFullYear(1970, 0, 1)

    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    let openingTime = new Date(branchData.openingTime)
    let closingTime = new Date(branchData.closingTime)

    let selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)

    let query = {
      startTime: {
        $gte: new Date(openingTime)
      },
      endTime: {
        $lte: new Date(closingTime)
      },
      status: STATUS.ACTIVE
    } as any
    //
    if (selectedDate.getTime() == currentDate.getTime()) {
      query.startTime = {
        $gte: openingTime
      }
    }
    //
    if (subServiceData)
      query.subService = new mongoose.Types.ObjectId(subServiceData._id)

    if (type)
      query.type = type

    // let amount = type === AppointmentConstants.CUSTOMER_TYPE.WALK_IN ? testDetailsBranch.walkInConsecutiveCustomers : testDetailsBranch.homeSampleConsecutiveCustomers

    let data = await this.slotRepository.getAvailableSlot(query, date, amount)

    // console.log(data.length)
    return data

  }

  async getAll(slotDTO: SlotDTO): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>();
    //@ts-ignore
    let { subService, type, date } = slotDTO

    // let arr = [];
    // let prev = moment("1970-01-01T00:00:00").utc(true)
    // for(let idx = 1 ;idx<=0;idx++){
    //   let time = moment("1970-01-01T00:00:00").utc(true).add(idx*30,"minutes")
    //   console.log(prev," - ",time)

    //   arr.push({
    //       "status" : "ACTIVE",
    //       "subService" : new mongoose.Types.ObjectId("6183f8d9065c7c4738ab0035"),
    //       "type" : "HOME_SAMPLE",
    //       "branch" :  new mongoose.Types.ObjectId("60be3a29190a0839ecc74262"),
    //       "startTime" :prev,
    //       "endTime" : time,
    //       "duration" : 30
    //   })
    // //   await Slot.create({
    // //     "status" : "ACTIVE",
    // //     "subService" : new mongoose.Types.ObjectId("6183f8d9065c7c4738ab0035"),
    // //     "type" : "HOME_SAMPLE",
    // //     "branch" :  new mongoose.Types.ObjectId("60be3a29190a0839ecc74262"),
    // //     "startTime" :prev,
    // //     "endTime" : time,
    // //     "duration" : 30
    // // })
    //   prev = time

    // }


    let subServiceData = await this.subServiceRepository.findOne({ _id: subService })
    let data;


    data = await this.getAvailableSlots({
      subServiceData,
      type,
      date,
      // zone
    })

    if (data.length) {
      response.setSuccessAndData(data)
      return response;
    }
    response.setError("Slots not available")
    return response
  };


  async getAllSlotsMultipleTest(): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>();

    let query = {
      status: STATUS.ACTIVE,
    };

    let data = await this.slotRepository.getSlotMultipleTest(query)
    response.setSuccessAndData(data)
    return response
  };


  async getCalender(obj: {
    shiftStartTime: any,
    shiftEndTime: any,
    shift: any,
    type: any,
    date: any,
    vendor: any,
    // zone
  }) {
    // let testDetailsBranch = branchData.testOffered.find((a) => String(a.test) == String(test))
    // let branchData = await Branch.findOne({ _id: SubServiceData.branch })



    let {
      shiftStartTime,
      shiftEndTime,
      type,
      date,
      vendor,
      // zone
    } = obj

    let branchData = await this.branchRepository.findOne({})
    let appointmentQuery = {} as any

    let openingTime = new Date(branchData.openingTime)
    let closingTime = new Date(branchData.closingTime)

    if (vendor) {
      appointmentQuery.vendor = new mongoose.Types.ObjectId(vendor)
    }
    if (date) {
      appointmentQuery["timeFormat"] = date.split("T")[0]
    }
    if (openingTime.getTime() > closingTime.getTime()) {
      closingTime.setDate(closingTime.getDate() + 1)
    }

    let query = {
      // startTime: {
      //     $gte: new Date(openingTime)
      // },
      // endTime: {
      //     $lte: new Date(closingTime)
      // },
      status: STATUS.ACTIVE
    } as any
    if (type) {
      query["type"] = type
    }

    let matchQuery = {}

    if (shiftStartTime > shiftEndTime) {
      // if (shiftStartTime ==  '19:00:00' || shiftStartTime ==  '20:00:00') {
      matchQuery = {
        $or: [
          { $gte: ["$startTimeFormat", shiftStartTime] },
          { $lte: ["$endTimeFormat", shiftEndTime] },
          // {$gte:["$endTimeFormat",shiftStartTime]},
          // {$lte:["$endTimeFormat",shiftEndTime]},

          // {$gte:["$startTimeFormat",shiftStartTime]},
          // {$lte:["$startTimeFormat",shiftEndTime]},

        ]
      }
    } else if (shiftStartTime == shiftEndTime) {
      matchQuery = {

        $or: [
          // { $gte: ["$endTimeFormat", shiftStartTime] },
          { $lte: ["$endTimeFormat", shiftEndTime] },

          { $gte: ["$startTimeFormat", shiftStartTime] },
          // { $lte: ["$startTimeFormat", shiftEndTime] },

        ]
      }
    } else {
      matchQuery = {

        $and: [
          { $gte: ["$endTimeFormat", shiftStartTime] },
          { $lte: ["$endTimeFormat", shiftEndTime] },

          { $gte: ["$startTimeFormat", shiftStartTime] },
          { $lte: ["$startTimeFormat", shiftEndTime] },

        ]
      }
    }

    let selectedDate = String(date)
    selectedDate = selectedDate.split('T')[0] + 'T00:00:00.000Z'

    // if (type)
    //     query.type = type

    // let amount = type === AppointmentConstants.CUSTOMER_TYPE.WALK_IN ? testDetailsBranch.walkInConsecutiveCustomers : testDetailsBranch.homeSampleConsecutiveCustomers

    let data = await this.slotRepository.getCalendorSlot(matchQuery, query, appointmentQuery)

    return data

  };

  async getCalenderData(query: { type: any, date: any, vendor: any, search: any, shift: any, startTime: any, endTime: any }):Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>();
    let { type, date, vendor, shift } = query

    let data;
    let shiftStartTime = null
    let shiftEndTime = null
    if (SHIFT.EARLY_MORNING == shift) {
      shiftStartTime = SHIFT_TIME.EARLY_MORNING_START_TIME
      shiftEndTime = SHIFT_TIME.EARLY_MORNING_END_TIME
    } else if (SHIFT.MORNING == shift) {
      shiftStartTime = SHIFT_TIME.MORNING_START_TIME
      shiftEndTime = SHIFT_TIME.MORNING_END_TIME
    } else if (SHIFT.AFTERNOON == shift) {
      shiftStartTime = SHIFT_TIME.AFTERNOON_START_TIME
      shiftEndTime = SHIFT_TIME.AFTERNOON_END_TIME
    } else if (SHIFT.EVENING == shift) {
      shiftStartTime = SHIFT_TIME.EVENING_START_TIME
      shiftEndTime = SHIFT_TIME.EVENING_END_TIME
    } else if (SHIFT.NIGHT == shift) {
      shiftStartTime = SHIFT_TIME.NIGHT_START_TIME
      shiftEndTime = SHIFT_TIME.NIGHT_END_TIME
    } else {
      // throw new Error("Shift is required")
    }

    if (shift) {
      shift = JSON.parse(shift)
    }
    shiftStartTime = moment(shift.startTime).utc().format("HH:mm:ss")
    shiftEndTime = moment(shift.endTime).utc().format("HH:mm:ss")

    data = await this.getCalender({
      shift: shift,
      shiftStartTime: shiftStartTime,
      shiftEndTime: shiftEndTime,
      type,
      date,
      vendor,
    });
    response.setSuccessAndData(data)
    return response
  };


}

export default SlotService