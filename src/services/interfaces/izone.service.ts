import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import ZoneDTO from "../../models/dto-models/zone.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * Zone Interface
 */
export default interface IZoneService {
    create(zoneArg: ZoneDTO): Promise<ResponseModel<ZoneDTO>> 

    update(updateDTO: { _id: string, name: string }): Promise<ResponseModel<ZoneDTO>> 

    getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<any[]>>>

    deleteZone(_id: string): Promise<ResponseModel<{}>> 
}