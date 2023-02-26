import RegionDTO from "../../models/dto-models/region.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * Region Interface
 */
export default interface IRegionService {
    create(regionDTO: RegionDTO): Promise<ResponseModel<RegionDTO>>

    update(regionDTO: RegionDTO): Promise<ResponseModel<RegionDTO>>

    getAll(): Promise<ResponseModel<Array<RegionDTO>>>

    deleteRegion(_id: string): Promise<ResponseModel<RegionDTO>>

    getAllWithoutZone(): Promise<ResponseModel<Array<RegionDTO>>>
}