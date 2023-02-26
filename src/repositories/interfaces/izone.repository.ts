import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import ZoneDTO from "../../models/dto-models/zone.dto";
import IRepository from "./irepository";

/**
 */
export default interface IZoneRepository extends IRepository<ZoneDTO> {

    getAllZone(query: Partial<ZoneDTO>, paginateOption: BaseQueryDTO): Promise<ListDTO<any[]>>
}