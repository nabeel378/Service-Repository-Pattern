import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import SubServiceDTO from "../../models/dto-models/subservice.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * SubService Interface
 */
export default interface ISubServiceService {
    /**
     * @param object  dto object
     */
    create(subserviceDTO: SubServiceDTO): Promise<ResponseModel<SubServiceDTO>> 

    update(updateDTO: SubServiceDTO): Promise<ResponseModel<SubServiceDTO>> 

    getAll(baseQuery: BaseQueryDTO, params: { service: string, searchQueryText: string }) :Promise<any>

    deleteSubService(_id: string): Promise<ResponseModel<any>> 
}