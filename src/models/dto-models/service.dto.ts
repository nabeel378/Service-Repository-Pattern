import mongoose from "mongoose";
import BaseDTO from "./base.dto";

class ServiceDTO extends BaseDTO {
    name: string = ""
    branch: mongoose.Types.ObjectId | undefined = undefined
    isHidden: boolean = false
}

export default ServiceDTO;