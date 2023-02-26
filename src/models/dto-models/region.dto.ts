import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class RegionDTO extends BaseDTO {
    @IsString()
    name: string = ""
    localities: string[] = [];
    zone:any = undefined
    isHidden: boolean = false
}

export default RegionDTO;