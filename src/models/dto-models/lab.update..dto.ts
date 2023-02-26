import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class UpdateLabDTO extends BaseDTO {
    @IsString()
    _id: string = "";
    @IsString()
    name: string = "";
}

export default UpdateLabDTO;