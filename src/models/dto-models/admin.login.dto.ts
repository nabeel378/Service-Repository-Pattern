import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class AdminLoginDTO extends BaseDTO {
    @IsEmail()
    email: string = ""
    @IsString()
    password: string = ""
}

export default AdminLoginDTO;