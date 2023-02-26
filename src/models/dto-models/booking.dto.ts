import { Schema, Types } from "mongoose";
import { CUSTOMER_TYPE, INITIAL_PAYMENT_TYPE, PAYMENT_TYPE, STATUS } from "../../enums/appointment.enum";
import BaseDTO from "./base.dto";

class BookingDTO extends BaseDTO {
    bookingId: string | undefined;
    noOfAppointments: number = 1
    firstName: string = ""
    lastName: string = ""
    phone: string = ""
    email: string = ""
    paymentType: PAYMENT_TYPE | undefined
    subService: Schema.Types.ObjectId[] = []
    password: string | undefined
    address: string = ""
    vendor!: Types.ObjectId
    vendorId: string | undefined
    vehicle: Object | string | undefined
    slot: Schema.Types.ObjectId | undefined
    members: Schema.Types.ObjectId[] = []
    zone!: Types.ObjectId 
    lat: number = 0
    lng: number = 0
    startTime!: Date;
    endTime!: Date;
    branch!: Schema.Types.ObjectId;
    time!: Date
    price: number = 0
    customerType: CUSTOMER_TYPE | undefined
    vat: number = 0
    addressTwo: string = ""
    status: STATUS = STATUS.BOOKED
    initialSubServices: {
        _id: Schema.Types.ObjectId;
        subService: Schema.Types.ObjectId;
        initialPrice: number;
    }[] = [];
    initialPaymentType!: INITIAL_PAYMENT_TYPE
    changeCount: number = 0;
    discount: number = 0;
    remarks:
        {
            admin: Schema.Types.ObjectId,
            vehicle: Schema.Types.ObjectId,
            remarks: string
        }[] = [];

    admin: Schema.Types.ObjectId | undefined
    appointmentTime: Date | undefined
    bdo: Schema.Types.ObjectId | undefined
    region: Schema.Types.ObjectId | null | undefined | string = null
    extraAmountIfNotCard: number = 0
    cancelBy: Schema.Types.ObjectId | undefined
    coordinate!: {
        lat:number,
        lng:number
    }
    covidTestCause: any;
  static covidTestCause: any;
  static airlineName: any;
  static destination: any;
  static symptoms: any;
}

export default BookingDTO;