import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import StaffMemberDTO from "../../models/dto-models/staff-member.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * StaffMember Interface
 */
export default interface IStaffMemberService {
    create(staffMemberArg: StaffMemberDTO): Promise<ResponseModel<StaffMemberDTO>> 

    update(updateDTO: StaffMemberDTO): Promise<ResponseModel<StaffMemberDTO>> 

    getAll(baseQuery: BaseQueryDTO, arg2: { staffGroup: string, searchQueryText: string }): Promise<ResponseModel<any[]>> 

    getAllStaffForVehicle(): Promise<ResponseModel<any[]>>

    deleteStaff(_id: string) :any
}