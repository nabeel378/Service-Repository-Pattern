import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import RegionDTO from "../../models/dto-models/region.dto";
import IRepository from "./irepository";

/**
 */
export default interface IRegionRepository extends IRepository<RegionDTO> {

    getAllRegion(query: Partial<RegionDTO>, paginateOption: BaseQueryDTO): Promise<ListDTO<any[]>>
}