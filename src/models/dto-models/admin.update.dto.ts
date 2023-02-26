import { IsString } from "../../utils/decorators/validation.decorator";
import AdminDTO from "./admin.dto";

class UpdateAdminDTO extends AdminDTO {
    @IsString()
    _id: string = ""
}

export default UpdateAdminDTO;