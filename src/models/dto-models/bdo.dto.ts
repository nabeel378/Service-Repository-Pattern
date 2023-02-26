import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class BDODTO extends BaseDTO {

    @IsString()
    name: string = ""

    phone: string = ""
    
    @IsEmail()
    email: string = ""

    isHidden: boolean = false
}

export default BDODTO;