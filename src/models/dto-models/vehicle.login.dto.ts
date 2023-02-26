import { STATUS } from "../../enums/vehicle.enum";
import { IsString } from "../../utils/decorators/validation.decorator";

class VehicleLoginDTO {
    @IsString()
    phone: string | undefined = undefined
    @IsString()
    password: string | undefined = undefined
    notificationToken: string | undefined = undefined
    status: STATUS = STATUS.ACTIVE
}

export default VehicleLoginDTO;