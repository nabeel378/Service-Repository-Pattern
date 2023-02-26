import { ResponseModel } from "../../utils/responsemodel";
import BranchDTO from "../../models/dto-models/Branch.dto";
import ListDTO from "../../models/dto-models/list.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";

/**
 * Branch Interface
 */
export default interface IBranchService {
    /**
     * @param object Branch dto object
     */
    findById(BranchId: string): Promise<ResponseModel<BranchDTO>>

    create(BranchArg: BranchDTO): Promise<ResponseModel<BranchDTO>>

    getAll(BaseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<BranchDTO>>>

    update(BranchArg: BranchDTO): Promise<ResponseModel<BranchDTO>>

    deleteBranch(_id:string): Promise<ResponseModel<{}>>
    
}