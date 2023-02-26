import StaffMemberDTO from "../../models/dto-models/staff-member.dto";
import IRepository from "./irepository";

/**
 * StaffMember Interface
 */
export default interface IStaffMemberRepository extends IRepository<StaffMemberDTO> {
    getAllStaffMember(query:Object,arg2:{page:number, limit:number, skip:number}):Promise<any[]>
}