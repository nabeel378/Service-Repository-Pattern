import { Schema } from "mongoose";
import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class ZoneDTO extends BaseDTO {
    @IsString()
    name: string = "";
    regions: Schema.Types.ObjectId[] = []
    zone:any = undefined
    isHidden: boolean = false
}

export default ZoneDTO;