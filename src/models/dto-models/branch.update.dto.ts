import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class UpdateBranchDTO extends BaseDTO {
    @IsString()
    _id: string = ""
    @IsString()
    name: string = ""
    branchCode: string = ""
    openingTime: Date
    closingTime: Date
    address: string = ""
    isAvailable: boolean
    zipCode: string
    phone: string
    testOffered: []
    cityId: any
    isHidden: boolean = false
}

export default UpdateBranchDTO;