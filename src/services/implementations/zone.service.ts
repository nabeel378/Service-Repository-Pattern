import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ForbiddenError, InternalError } from "../../errors/app.error";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import ZoneDTO from "../../models/dto-models/zone.dto";
import IZoneRepository from "../../repositories/interfaces/izone.repository";
import StaticStringKeys from "../../utils/constant";
import { DataCopier } from "../../utils/datacopier";
import { ResponseModel } from "../../utils/responsemodel";
import IZoneService from "../interfaces/izone.service";
import IUnitOfWork from "../../repositories/interfaces/iunit-of-work";
import UnitOfWork from "../../repositories/implementations/unit-of-work";

@injectable()
class ZoneService implements IZoneService {
  constructor(
    @inject(SERVICE_IDENTIFIER.ZoneRepository) private zoneRepository: IZoneRepository,
    //@ts-ignore
    @inject(SERVICE_IDENTIFIER.UnitOfWork) private unitOfWork: IUnitOfWork,

  ) { }
  async create(zoneArg: ZoneDTO): Promise<ResponseModel<ZoneDTO>> {
    const response = new ResponseModel<ZoneDTO>();
    let unitOfWork = new UnitOfWork()
    await unitOfWork.start()
    try{

      const zone = new ZoneDTO()
      const entity = DataCopier.copy(zone, zoneArg);
      const result = await this.zoneRepository.create(entity,{session:unitOfWork.session})
      
      if (result) {
        response.setSuccessAndData(result, StaticStringKeys.SUCCESSFULL_SAVE)
      } else {
        throw new InternalError(StaticStringKeys.FAILED_TO_SAVE)
      }
      // this.unitOfWork.commit()
      // unitOfWork.rollback()
    }catch(err){
      await unitOfWork.rollback()

    }
      return response
  }

  async update(updateDTO: { _id: string, name: string }): Promise<ResponseModel<ZoneDTO>> {
    const response = new ResponseModel<ZoneDTO>();

    let { _id, name } = updateDTO;

    if (!_id) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    await this.zoneRepository.update({ _id }, { name });

    let zone = await this.zoneRepository.findOne({ _id });

    response.setSuccess(`${zone.name} is updated`)
    return response
  }

  async getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<any[]>>> {
    const response = new ResponseModel<ListDTO<any[]>>();

    let paginateOption = {} as BaseQueryDTO

    if (baseQuery.page) {
      paginateOption.page = Number(baseQuery.page)
      paginateOption.limit = Number(baseQuery.limit)
    }
    let query = {
      isHidden: false,
    } as any

    if (searchQueryText) {
      query["name"] = { $regex: searchQueryText, "$options": "i" }
    }

    let data = await this.zoneRepository.getAllZone(query, paginateOption);
    response.setSuccessAndData(data)
    return response
  }

  async deleteZone(_id: string): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();

    if (!_id) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED);
    }
    await this.zoneRepository.update({ _id: _id }, { isHidden: true });

    let zone = await this.zoneRepository.findOne({ _id: _id });

    response.setSuccess(`${zone.name} is deleted`)
    return response
  }
}

export default ZoneService