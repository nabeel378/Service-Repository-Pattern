import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { CUSTOMER_TYPE } from "../../enums/appointment.enum";
import { STATUS } from "../../enums/slot.enum";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import SlotDTO from "../../models/dto-models/slot.dto";
import SubServiceDTO from "../../models/dto-models/subservice.dto";
import IBranchRepository from "../../repositories/interfaces/ibranch.repository";
import IServiceRepository from "../../repositories/interfaces/iservice.repository";
import ISlotRepository from "../../repositories/interfaces/islot.repository";
import ISubServiceRepository from "../../repositories/interfaces/isubservice.repository";
import StaticStringKeys from "../../utils/constant";
import { ResponseModel } from "../../utils/responsemodel";
import ISubServiceService from "../interfaces/isubservice.service";

@injectable()
class SubServiceService implements ISubServiceService {
  constructor(
    @inject(SERVICE_IDENTIFIER.SubServiceRepository) private subServiceRepository: ISubServiceRepository,
    @inject(SERVICE_IDENTIFIER.ServiceRepository) private serviceRepository: IServiceRepository,
    @inject(SERVICE_IDENTIFIER.SlotRepository) private slotRepository: ISlotRepository,
    @inject(SERVICE_IDENTIFIER.BranchRepository) private branchRepository: IBranchRepository,
  ) { }


  async createSlotForSubService(branch: { _id: any; }, subService: { _id: any; }, serviceCases: any[], duration: any): Promise<SlotDTO[]> {
    let slots: SlotDTO[] = []
    if (serviceCases.length) {

      let dayStartTime = new Date(new Date(new Date(new Date(new Date().setHours(0)).setMinutes(0)).setSeconds(0)).setMilliseconds(0))
      let dayEndTime = new Date(new Date(new Date(new Date(new Date(dayStartTime).setHours(23)).setMinutes(59)).setSeconds(59)).setMilliseconds(999))

      serviceCases.forEach(elem => {

        if (elem === CUSTOMER_TYPE.WALK_IN) {
          for (let i = dayStartTime.getTime(); new Date(i).setMinutes(new Date(i).getMinutes() + Number(duration)) <= dayEndTime.getTime(); i = new Date(i).setMinutes(new Date(i).getMinutes() + Number(duration))) {

            let startTime = new Date(i)
            startTime.setSeconds(0, 0)
            startTime.setFullYear(1970, 0, 1)
            let endTime = new Date(new Date(i).setMinutes(new Date(i).getMinutes() + Number(duration)))
            endTime.setSeconds(0, 0)
            endTime.setFullYear(1970, 0, 1)

            if (startTime.getTime() > endTime.getTime()) {
              endTime.setDate(endTime.getDate() + 1)
            }

            let obj = {
              subService: subService._id,
              type: CUSTOMER_TYPE.WALK_IN,
              branch: branch._id,
              startTime,
              endTime,
              duration,

            } as SlotDTO
            slots.push(obj)
          }
        }

        if (elem === CUSTOMER_TYPE.HOME_SAMPLE) {

          for (let i = dayStartTime.getTime(); new Date(i).setMinutes(new Date(i).getMinutes() + Number(duration)) <= dayEndTime.getTime(); i = new Date(i).setMinutes(new Date(i).getMinutes() + Number(duration))) {

            let startTime = new Date(i)
            startTime.setSeconds(0, 0)
            startTime.setFullYear(1970, 0, 1)
            let endTime = new Date(new Date(i).setMinutes(new Date(i).getMinutes() + Number(duration)))
            endTime.setSeconds(0, 0)
            endTime.setFullYear(1970, 0, 1)

            if (startTime.getTime() > endTime.getTime()) {
              endTime.setDate(endTime.getDate() + 1)
            }

            let obj = {
              subService: subService._id,
              type: CUSTOMER_TYPE.HOME_SAMPLE,
              branch: branch._id,
              startTime,
              endTime,
              duration,
            } as SlotDTO
            slots.push(obj)
          }
        }
      });


    }
    return slots

  };

  async create(subserviceDTO: SubServiceDTO): Promise<ResponseModel<SubServiceDTO>> {
    const response = new ResponseModel<SubServiceDTO>();
    let { serviceType, name, type, serviceCases, price, duration, reportGenerationHours } = subserviceDTO
    if (!duration || !serviceCases)
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    let serviceCheck = await this.serviceRepository.findOne({});


    if (!serviceCheck) {
      throw new NotFoundError("Service Not Found")
    }

    let branch = await this.branchRepository.findOne({ _id: serviceCheck.branch });

    const isSubServices = await this.subServiceRepository.findOne({ serviceType: serviceType, isHidden: false, name: name });
    if (isSubServices) {
      throw new ForbiddenError("Sub Service is already created")
    }
    let payload = {
      service: serviceCheck._id,
      serviceType,
      name,
      type,
      serviceCases,
      price,
      duration,
      reportGenerationHours
    } as SubServiceDTO
    //@ts-ignore
    let subServiceData = await this.subServiceRepository.create(payload)

    const slotsArray = await this.createSlotForSubService({ _id: branch._id }, subServiceData, serviceCases, duration)
    await this.slotRepository.insertMany(slotsArray)
    response.setSuccessAndData(subServiceData,"sub service is created")
    return response;
  }

  async update(updateDTO: SubServiceDTO): Promise<ResponseModel<SubServiceDTO>> {
    const response = new ResponseModel<SubServiceDTO>();
    let { _id, serviceType, name, type, serviceCases, price, duration, reportGenerationHours } = updateDTO
    let checkSubService = await this.subServiceRepository.findOne({ _id: _id });
    let service = await this.serviceRepository.findOne({});
    if (!checkSubService) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }

    let payload = {
      service: service._id,
      serviceType,
      name,
      type,
      serviceCases,
      price,
      duration,
      reportGenerationHours
    }

    await this.subServiceRepository.update({ _id }, payload);

    // let subServiceData = await this.subServiceRepository.findOne({ _id: _id });

    // let branch = await this.branchRepository.findOne({});

    if (Number(duration) !== Number(checkSubService.duration) || checkSubService.serviceCases.length !== serviceCases.length) {
      await this.slotRepository.updateMany({ subService: _id, status: STATUS.ACTIVE }, { status: STATUS.DELETED })

      // let slotData = await this.createSlotForSubService({_id:branch._id}, {_id:subServiceData._id}, serviceCases, duration)
      // await this.slotRepository.insertMany(slotData)
    }
    //  slots update here

    response.setSuccess(StaticStringKeys._UPDATE_SUCCESSFUL("sub service"))
    return response
  }


  async getAll(baseQuery: BaseQueryDTO, params: { service: string, searchQueryText: string }) {
    const response = new ResponseModel<ListDTO<SubServiceDTO>>();

    let { service, searchQueryText, page, limit } = { ...baseQuery, ...params }
    let query = {
      isHidden: false,
    } as any
    let skip;
    if (!page) {
      skip = 0;
      limit = Number.MAX_SAFE_INTEGER;
    } else {
      skip = (Number(page) * Number(limit)) - Number(limit);
    }
    if (service)
      query.service = new mongoose.Types.ObjectId(service)
    if (searchQueryText) {
      query["name"] = { $regex: searchQueryText, "$options": "i" }
    }

    let data = await this.subServiceRepository.getAllSubService(query, { page, limit, skip }) as any

    [data] = data;

    if (data.metaData.length === 0) {
      data.metaData = {
        totalDocuments: 0,
        page:+page,
        limit:+limit,
      };
    } else {
      [data.metaData] = data.metaData;
    }

    response.setSuccessAndData(data)
    return response
  }

  async deleteSubService(_id: string): Promise<ResponseModel<any>> {
    const response = new ResponseModel<any>();
    let check = await this.subServiceRepository.findOne({ _id });

    if (!check) {
      throw new ForbiddenError("Sub Service not found");
    }
    await this.subServiceRepository.update({ _id }, { isHidden: true });

    response.setSuccess("sub service is deleted")
    return response 
}

}

export default SubServiceService