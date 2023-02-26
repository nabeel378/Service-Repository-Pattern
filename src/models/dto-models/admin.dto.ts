import { ROLES, STATUS } from "../../enums/admin.enum";
import BaseDTO from "./base.dto";

class AdminDTO extends BaseDTO {
    firstName: string = ""
    name: string = ""
    email: string = ""
    password: string = ""
    isSuperAdmin: boolean = false
    status: STATUS = STATUS.ACTIVE
    role: ROLES | undefined = undefined
    maxDiscount: number = 0
    totalCashInHand: number = 0
    totalCollected: number = 0
    roles: any = {}
    twoFaSecret: {base32:string} = {} as any
    totpSecret: Object = {}
    deviceToken: string = ""

}

export default AdminDTO;