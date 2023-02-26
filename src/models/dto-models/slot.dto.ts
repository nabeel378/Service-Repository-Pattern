import { Schema } from "mongoose";
import { CUSTOMER_TYPE } from "../../enums/appointment.enum";
import { STATUS } from "../../enums/slot.enum";
import BaseDTO from "./base.dto";

class SlotDTO extends BaseDTO {
    subService: Schema.Types.ObjectId | undefined
    branch: Schema.Types.ObjectId | undefined
    doctor: Schema.Types.ObjectId | undefined
    startTime!: Date
    endTime!: Date
    duration: number = 0
    type!: CUSTOMER_TYPE
    status: STATUS = STATUS.ACTIVE

}

export default SlotDTO;