import mongoose from "mongoose";
import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class LabDTO extends BaseDTO {
    @IsString()
    name: string = "";
    totalSamples: number = 0;
    totalAmountPaid: number = 0;
    totalAmountEarned: number = 0;
    subServicesOffered: { subService: mongoose.Schema.Types.ObjectId, price: number }[] = [];
    isHidden: boolean = false

}

export default LabDTO;