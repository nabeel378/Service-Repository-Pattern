import { Schema } from "mongoose";
import { GENDER } from "../../enums/user.enum";
import { STATUS } from "../../enums/vehicle.enum";
import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class VehicleDTO extends BaseDTO {
  status: STATUS = STATUS.ACTIVE
  name: string = ""
  @IsString()
  firstName: string = ""
  lastName: string = ""
  @IsString()
  phone: string = ""
  isAvailable: boolean = false
  members: {
    member: Schema.Types.ObjectId,
    startTime: Date,
    endTime: Date
  }[] = []
  licencePlate: string = ""
  gender: GENDER | undefined
  dob!: Date
  color: string = ""
  @IsEmail()
  email: string = ""
  isHidden: boolean = false
  @IsString()
  password: string | undefined
  location: Object | undefined
  coordinates: number[] = []
  totalAvailableAmount: number = 0
  totalReceivedAmount: number = 0
  subServices: Schema.Types.ObjectId[] = []


}

export default VehicleDTO;