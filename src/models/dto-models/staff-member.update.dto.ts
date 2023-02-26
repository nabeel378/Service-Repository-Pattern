import { GENDER, TYPE } from "../../enums/user.enum";
import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class UpdateStaffMemberDTO extends BaseDTO {
    @IsString()
    _id: string | undefined = undefined
    @IsString()
    lastName: string | undefined = undefined
    startTime: Date | undefined = undefined
    endTime: Date | undefined = undefined
    dob: Date | undefined = undefined
    @IsString()
    phone: string | undefined = undefined
    gender: GENDER | undefined = undefined
    password: string | undefined = undefined
    @IsEmail()
    email: string | undefined = undefined
    type: TYPE | undefined = undefined
}

export default UpdateStaffMemberDTO;