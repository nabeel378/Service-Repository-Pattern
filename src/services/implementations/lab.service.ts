import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import LabDTO from "../../models/dto-models/lab.dto";
import UpdateLabDTO from "../../models/dto-models/lab.update..dto";
import ListDTO from "../../models/dto-models/list.dto";
import ILabRepository from "../../repositories/interfaces/ilab.repository";
import StaticStringKeys from "../../utils/constant";
import { DataCopier } from "../../utils/datacopier";
import { ResponseModel } from "../../utils/responsemodel";
import ILabService from "../interfaces/ilab.service";

@injectable()
class LabService implements ILabService {
  constructor(
    @inject(SERVICE_IDENTIFIER.LabRepository) private labRepository: ILabRepository
  ) { }

  async create(labDTO: LabDTO): Promise<ResponseModel<LabDTO>> {
    const response = new ResponseModel<LabDTO>();
    let { name } = labDTO
    if (!name) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    let isLab = await this.labRepository.findOne({ name: name, isHidden: false });
    if (isLab) {
      throw new ForbiddenError(`'${name}' name is already in use. it must be unique`)
    }
    const lab = new LabDTO()
    const entity = DataCopier.copy(lab, LabDTO);
    const result = await this.labRepository.create(entity);
    response.setErrorAndData(result, StaticStringKeys.CREATED_SUCCESSFUL("lab"))
    return response;
  }

  async update(updateLabDTO: UpdateLabDTO): Promise<ResponseModel<LabDTO>> {
    const response = new ResponseModel<LabDTO>();
    let { _id, name, } = updateLabDTO
    if (!_id) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    const result = await this.labRepository.update({ _id: _id }, { name })
    response.setSuccessAndData(result, StaticStringKeys._UPDATE_SUCCESSFUL("lab"))
    return response
  }

  private checkAndCreateForLabs(obj: { _id: string, price: number | string, subService: string }, previousSubServices: any[]) {
    return new Promise(async (resolve, reject) => {
      let { _id } = obj
      let checkPrevious = previousSubServices.find((item: any) => String(item.subService) === String(_id))
      if (checkPrevious) {
        reject({ message: "You can't assign a sub Service twice" })
      }
      let payload = {
        subService: obj._id,
        price: obj.price,
      }
      resolve(payload)
    })
  };

  async getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<any>>> {
    const response = new ResponseModel<ListDTO<any>>();

    let { page = 1, limit = 50 } = baseQuery

    let paginateOption = {} as BaseQueryDTO

    if (page) {
      paginateOption.page = Number(page)
      paginateOption.limit = Number(limit)
    }
    let query = {
      isHidden: false
    } as { name: string | undefined, isHidden: boolean };

    if (searchQueryText) {
      query["name"] = { $regex: searchQueryText, "$options": "i" } as any;
    }
    let labs = await this.labRepository.getAllLab(query, paginateOption) as any

    response.setSuccessAndData(labs)
    return response;
  }


  async deleteLab(deleteLabDTO: { _id: string }): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>()
    let { _id } = deleteLabDTO;
    if (!_id) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    const deleteLab = await this.labRepository.softDelete(_id);
    if (deleteLab) {
      response.setSuccess(StaticStringKeys.DELETED_SUCCESSFUL("lab"))
    } else {
      response.setError(StaticStringKeys.FAILED_TO_DELETE)
    }
    return response;
  }

  async createSubservicesForLab(subServiceDTO: { lab: string, subServices: any[] }): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();
    let { lab, subServices } = subServiceDTO
    let labData = await this.labRepository.findOne({ _id: lab });
    if(!labData){
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("lab"))
    }

    if (subServices && subServices.length) {

      let previousSubServices: any = labData.subServicesOffered ? labData.subServicesOffered : []
      let updatArray: any[] = []

      subServices.forEach((obj: any) => {
        updatArray.push(this.checkAndCreateForLabs(obj, previousSubServices))
      });
      let finalsubServices = await Promise.all(updatArray);
      await this.labRepository.update({ _id: lab }, { $push: { subServicesOffered: { $each: finalsubServices } } });
      response.setSuccess(StaticStringKeys._UPDATE_SUCCESSFUL("lab subservice(s"))
      return response
    }

    response.setSuccess(StaticStringKeys.CREATED_SUCCESSFUL("lab subservice(s"))

    return response
  }


  async deleteSubService(deleteSubServiceDTO: { _id: string, subService: string }): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();
    let { _id, subService } = deleteSubServiceDTO

    await this.labRepository.update({ _id }, { $pull: { subServicesOffered: { subService: subService } } });

    response.setSuccess(StaticStringKeys.DELETED_SUCCESSFUL("subService"))

    return response
  }

  async updateSubService(updateServiceDTO: { lab: string, subService: string, price: string }): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();
    let { lab, subService, price } = updateServiceDTO;
    let labData = await this.labRepository.findOne({ _id: lab });
    if(!labData){
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("lab"))
    }
    await this.labRepository.update({ _id: lab, "subServicesOffered.subService": subService }, { $set: { "subServicesOffered.$.price": price } })

    response.setSuccess(StaticStringKeys._UPDATE_SUCCESSFUL("subService"))
    return response
  }

  async getAllSubservices(arg0: { lab: string }): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>();
    let { lab } = arg0

    if (!lab) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    let query = {
      "isHidden": false,
      _id: new mongoose.Types.ObjectId(lab),
    }

    let labs = await this.labRepository.getAllLabSubService(query);

    if (labs[0].subServicesOffered && labs[0].subServicesOffered.length) {
      response.setSuccessAndData(labs[0].subServicesOffered as any)
      return response
    }
    response.setSuccess("This lab is not offering any sub service")
    return response
  }

}

export default LabService