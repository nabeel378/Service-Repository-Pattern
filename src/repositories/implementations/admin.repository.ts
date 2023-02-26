import Repository from "./repository";
import AdminDTO from "../../models/dto-models/admin.dto";
import IAdminRepository from "../interfaces/iadmin.repository";
import Model, { DB_NAME } from "../../models/repo-models/admin.model"
import { injectable } from "inversify";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import { STATUS } from "../../enums/admin.enum";

@injectable()
class AdminRepository extends Repository<AdminDTO> implements IAdminRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    getAll(query: Object, BaseQuery: BaseQueryDTO): Promise<ListDTO<AdminDTO>> {
        const result = this.aggregate([{ $match: { ...query, status: STATUS.ACTIVE } }], true, BaseQuery) as Promise<ListDTO<AdminDTO>>;
        return result
    }

}

export default AdminRepository