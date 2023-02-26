import { IsArray,  IsString } from "../../utils/decorators/validation.decorator";

class LabServiceDTO  {
    @IsString()
    lab: string = ""
    @IsArray()
    subServices: any[] = [] 
}

export default LabServiceDTO;