import { Schema } from "mongoose";
import { CUSTOMER_TYPE } from "../../enums/appointment.enum";
import { SUB_SERVICE_TYPE } from "../../enums/subservice.enum";
import { IsArray, IsNumber, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class SubServiceDTO extends BaseDTO {
    service: Schema.Types.ObjectId | undefined = undefined
    branch: Schema.Types.ObjectId | undefined = undefined
    @IsString()
    name: string = "";
    serviceType: SUB_SERVICE_TYPE | undefined = undefined
    @IsNumber()
    price: number = 0
    @IsString()
    type: string = ""
    reportGenerationHours: number = 0
    @IsNumber()
    duration: number = 30
    @IsArray()
    serviceCases: CUSTOMER_TYPE[] = []
    isHidden: boolean = false
}

export default SubServiceDTO;