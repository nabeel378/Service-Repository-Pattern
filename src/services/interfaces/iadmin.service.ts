import { ResponseModel } from "../../utils/responsemodel";
import AdminDTO from "../../models/dto-models/admin.dto";
import CreateAdminDTO from "../../models/dto-models/admin.create.dto";
import AdminOTPVerifyDTO from "../../models/dto-models/admin.otp.verification.dto";
import AdminLoginDTO from "../../models/dto-models/admin.login.dto";
import ListDTO from "../../models/dto-models/list.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";

/**
 * Admin Interface
 */
export default interface IAdminService {
    /**
     * @param object Admin dto object
     */
    findById(adminId: string): Promise<ResponseModel<AdminDTO>>

    create(adminArg: CreateAdminDTO): Promise<ResponseModel<AdminDTO>>

    VerifyLoginOTPCode(loginArg: AdminOTPVerifyDTO): Promise<ResponseModel<{ token: string, admin: AdminDTO }>>

    login(loginArg: AdminLoginDTO): Promise<ResponseModel<AdminDTO>>

    getAll(BaseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<AdminDTO>>>

    update(adminArg: AdminDTO): Promise<ResponseModel<AdminDTO>>

}