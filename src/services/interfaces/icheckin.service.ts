import { ResponseModel } from "../../utils/responsemodel";

/**
 * Bdo Interface
 */
export default interface ICheckinService {
    /**
     * @param object  dto object
     */
     toggle(adminId: string, status:string): Promise<ResponseModel<any>> }