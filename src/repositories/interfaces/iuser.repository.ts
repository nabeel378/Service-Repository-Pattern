import UserDTO from "../../models/dto-models/user.dto";
import IRepository from "./irepository";

/**
 * User Interface
 */
export default interface IUserRepository extends IRepository<UserDTO> {
    getAllUser(query: Partial<UserDTO>, page: string | number, limit: string | number, skip: string | number) :Promise<any>


}