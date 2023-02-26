import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class UpdateBookingDTO extends BaseDTO {
    @IsString()
    _id: string =""
}

export default UpdateBookingDTO;