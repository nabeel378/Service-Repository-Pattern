import { CUSTOMER_TYPE, INITIAL_PAYMENT_TYPE, PAYMENT_TYPE, STATUS } from "../../enums/appointment.enum";
import { IsArray, IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class CreateBookingDTO extends BaseDTO {
    noOfAppointments: number = 1
    @IsString()
    firstName: string = ""
    @IsString()
    lastName: string = ""
    phone: string = ""
    @IsEmail()
    email: string = ""
    paymentType!: PAYMENT_TYPE
    @IsArray()
    subService: string[] = []
    password: string | undefined
    address: string = ""
    vendor!: string
    vendorId!: string;
    vehicle: string | undefined
    slot: string | undefined
    members: string[] = []
    zone: string | undefined
    lat: number = 0
    lng: number = 0
    startTime!: Date;
    endTime!: Date;
    branch!: string;
    time!: Date
    price: number = 0
    customerType: CUSTOMER_TYPE | undefined
    vat: number = 0
    addressTwo: string = ""
    status: STATUS = STATUS.BOOKED
    initialSubServices: {
        _id: string;
        subService: string;
        initialPrice: number;
    }[] = [];
    initialPaymentType!: INITIAL_PAYMENT_TYPE
    changeCount: number = 0;
    discount: number = 0;
    remarks:
        {
            admin: string,
            vehicle: string,
            remarks: string
        }[] = [];

    admin: string | undefined
    appointmentTime: Date | undefined
    bdo: string | undefined
    region!: string
    extraAmountIfNotCard: number = 0
    cancelBy: string | undefined
    coordinate: {
        lat: number,
        lng: number
    } = { lat: 0, lng: 0 }
}

export default CreateBookingDTO;