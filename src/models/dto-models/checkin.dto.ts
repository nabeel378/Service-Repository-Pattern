import BaseDTO from "./base.dto";

class CheckinDTO extends BaseDTO {
    admin: string = ""
    time!: Date 
    status!:string 
    isHidden: boolean = false
}

export default CheckinDTO;