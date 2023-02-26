import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";

class UpdateBDODTO {
    @IsString()
    _id: string = ""
    @IsString()
    name: string = ""
    phone: string = ""
    @IsEmail()
    email: string = ""
    isHidden: boolean = false
}

export default UpdateBDODTO;