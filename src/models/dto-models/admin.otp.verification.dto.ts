import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class AdminOTPVerifyDTO extends BaseDTO {
    @IsString()
    _id: string = ""
    @IsString()
    token: string = ""
}

export default AdminOTPVerifyDTO;