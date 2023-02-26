import AdminDTO from "../../models/dto-models/admin.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import IRepository from "./irepository";

/**
 * Admin Interface
 */
export default interface IAdminRepository extends IRepository<AdminDTO> {

    getAll(query: Object, BaseQuery: BaseQueryDTO): Promise<ListDTO<AdminDTO>>
}