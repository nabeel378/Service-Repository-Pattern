import SubServiceDTO from "../../models/dto-models/subservice.dto";
import IRepository from "./irepository";

/**
 * SubService Interface
 */
export default interface ISubServiceRepository extends IRepository<SubServiceDTO> {
    getAllSubService(query: Partial<SubServiceDTO>,paginated:{page:number,limit:number,skip:number}): Promise<any[]> 

}