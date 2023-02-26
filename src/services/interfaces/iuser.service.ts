import UserDTO from "../../models/dto-models/user.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * User Interface
 */
export default interface IUserService {
    findById(id: string): Promise<ResponseModel<UserDTO>>

    createUser(userDTO: UserDTO, filesObj: any): Promise<ResponseModel<UserDTO>>

    loginUser(loginDTO: { email: string, password: string, pushToken: string }): Promise<ResponseModel<any>>

    updateUser(userDTO: UserDTO, fileObj: any): Promise<ResponseModel<UserDTO>>

    forgetPassword(email: string): Promise<ResponseModel<any>>

    verifyOTP(verifyDTO: { otp: string, email: string }): Promise<ResponseModel<any>>

    getAll(queryDTO: { searchQueryText: string, search: string, type: string, page: number, limit: number }): Promise<ResponseModel<any>>
}
