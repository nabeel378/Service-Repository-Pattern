import { ResponseModel } from "../../utils/responsemodel";
import BdoDTO from "../../models/dto-models/Bdo.dto";
import ListDTO from "../../models/dto-models/list.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";

/**
 * Bdo Interface
 */
export default interface IBdoService {
    /**
     * @param object Bdo dto object
     */
    findById(BdoId: string): Promise<ResponseModel<BdoDTO>>

    create(BdoArg: BdoDTO): Promise<ResponseModel<BdoDTO>>

    getAll(BaseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<BdoDTO>>>

    update(BdoArg: BdoDTO): Promise<ResponseModel<BdoDTO>>

    deleteBdo(_id:string): Promise<ResponseModel<{}>>
}