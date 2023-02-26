import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";
import { STATUS, TYPE } from '../../enums/finance.enum';
import { CUSTOMER_TYPE } from "../../enums/appointment.enum";

class CreateFinanceDTO extends BaseDTO {
    status: STATUS
    amount: number = 0
    customerType: CUSTOMER_TYPE
    vehicleId: string = ""
    adminID: string = ""
    financeAdminId: string = ""
    vendorId: string = ""
    paymentType: string
    type: TYPE
    transactionDetails: object
    bookingId: string
    labId: string
    time: Date = new Date()
    bdo: string
    slipsUrls: []
    noOfAppointments: number = 1
}

export default CreateFinanceDTO;