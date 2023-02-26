import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import LabDTO from "../../models/dto-models/lab.dto";
import UpdateLabDTO from "../../models/dto-models/lab.update..dto";
import ListDTO from "../../models/dto-models/list.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * lab Interface
 */
export default interface ILabService {
    create(labDTO: LabDTO): Promise<ResponseModel<LabDTO>>

    update(updateLabDTO: UpdateLabDTO): Promise<ResponseModel<LabDTO>>

    getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<any>>>

    deleteLab(deleteLabDTO: { _id: string }): Promise<ResponseModel<{}>>

    createSubservicesForLab(subServiceDTO: { lab: string, subServices: any[] }): Promise<ResponseModel<{}>>

    deleteSubService(deleteSubServiceDTO: { _id: string, subService: string }): Promise<ResponseModel<{}>>

    updateSubService(updateServiceDTO: { lab: string, subService: string, price: string }):Promise<ResponseModel<{}>>

    getAllSubservices(arg0: { lab: string }): Promise<ResponseModel<any[]>>
}