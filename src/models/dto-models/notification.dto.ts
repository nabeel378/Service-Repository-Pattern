import mongoose from "mongoose";
import { ROLES } from "../../enums/defaults.enum";

class NotificationDTO {
    token: string |undefined= undefined
      user: mongoose.Types.ObjectId | undefined
      userType: ROLES | undefined = undefined 
    }

export default NotificationDTO;