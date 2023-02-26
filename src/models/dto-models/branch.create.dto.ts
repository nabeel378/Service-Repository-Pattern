import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class CreateBranchDTO extends BaseDTO {
    @IsString()
    name: string = ""
    branchCode: string = ""
    openingTime: Date | undefined
    closingTime: Date | undefined
    address: string = ""
    isAvailable: boolean | undefined
    zipCode: string | undefined
    phone: string | undefined
    testOffered: [] = [];
    cityId: any
    isHidden: boolean = false
}

export default CreateBranchDTO;