import BaseDTO from "./base.dto";
import { STATUS, TYPE } from '../../enums/finance.enum';
import { CUSTOMER_TYPE } from "../../enums/appointment.enum";
import { ObjectId, Schema } from "mongoose";

class FinanceDTO extends BaseDTO {
    status: STATUS | undefined = undefined
    amount: number = 0
    admin: Schema.Types.ObjectId | undefined = undefined
    vehicle: any= ""
    customerType: CUSTOMER_TYPE | undefined = undefined
    vehicleId: string = "" 
    adminID: string = ""
    booking: string | ObjectId  | undefined = undefined
    vendor: string | ObjectId  | undefined = undefined
    financeAdminId: string = ""
    vendorId: string = ""
    paymentType: string = ""
    type: TYPE | undefined = undefined
    transactionDetails: object = {}
    bookingId: string = ""
    labId: string = ""
    time: Date = new Date()
    bdo: string = ""
    slipsUrls: [] = []
    noOfAppointments: number = 1
}

export default FinanceDTO;