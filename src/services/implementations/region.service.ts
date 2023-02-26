import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ForbiddenError } from "../../errors/app.error";
import RegionDTO from "../../models/dto-models/region.dto";
import IRegionRepository from "../../repositories/interfaces/iregion.repository";
import IZoneRepository from "../../repositories/interfaces/izone.repository";
import StaticStringKeys from "../../utils/constant";
import { ResponseModel } from "../../utils/responsemodel";
import IRegionService from "../interfaces/iregion.service";

@injectable()
class RegionService implements IRegionService {
  constructor(
    @inject(SERVICE_IDENTIFIER.RegionRepository) private regionRepository: IRegionRepository,
    @inject(SERVICE_IDENTIFIER.ZoneRepository) private zoneRepository: IZoneRepository,

  ) { }

  async create(regionDTO: RegionDTO): Promise<ResponseModel<RegionDTO>> {
    const response = new ResponseModel<RegionDTO>();
    let { name, localities, _id } = regionDTO;

    if (!name || !localities)
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    //@ts-ignore
    let region = await this.regionRepository.create({ name, localities, zone: _id })
    await this.zoneRepository.update({ _id: _id }, { $push: { regions: region._id } });


    response.setSuccess(`${region.name} is created`)
    return response
  }

  async update(regionDTO: RegionDTO): Promise<ResponseModel<RegionDTO>> {
    const response = new ResponseModel<RegionDTO>();
    let { _id, name, localities, zone } = regionDTO;

    if (!_id)
      throw new Error('data not provided')

    const result = await this.regionRepository.update({ _id }, { name, localities, zone });
    response.setSuccessAndData(result, StaticStringKeys.SUCCESSFULL_UPDATE)
    return response
  }


  async deleteRegion(_id: string): Promise<ResponseModel<RegionDTO>> {
    const response = new ResponseModel<RegionDTO>()
    if (!_id) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    _id = new mongoose.Types.ObjectId(_id) as any
    await this.regionRepository.softDelete(_id)

    response.setSuccess(StaticStringKeys.DELETED_SUCCESSFUL("region"))
    return response
  }

  async getAllWithoutZone(): Promise<ResponseModel<Array<RegionDTO>>> {
    const response = new ResponseModel<Array<RegionDTO>>();
    let data = await this.regionRepository.find({ zone: { $exists: false }, isHidden: false });
    response.setSuccessAndData(data)
    return response

  }

  async getAll(): Promise<ResponseModel<Array<RegionDTO>>> {
    const response = new ResponseModel<Array<RegionDTO>>();
    let query = {
      isHidden: false,
    }
    let data = await this.regionRepository.find(query);

    response.setSuccessAndData(data)
    return response
  }
}

export default RegionService