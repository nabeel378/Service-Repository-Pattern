import { ROLES } from "../../enums/admin.enum";
import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class CreateAdminDTO extends BaseDTO {
    @IsString()
    name: string = ""
    @IsEmail()
    email: string = ""
    @IsString()
    password: string = ""
    role: ROLES = {} as ROLES
}

export default CreateAdminDTO;