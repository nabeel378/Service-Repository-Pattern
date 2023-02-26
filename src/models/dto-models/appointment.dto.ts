import { Schema } from "mongoose";
import { APPOINTMENT_FOR, CAUSES, CUSTOMER_TYPE, INITIAL_PAYMENT_TYPE, PAYMENT_TYPE, STATUS, SYMPTOMS, TYPE } from "../../enums/appointment.enum";
import { COMMISSION_TYPE } from "../../enums/subservice.enum";
import BaseDTO from "./base.dto";


class TestDTO {
    subServiceId: Schema.Types.ObjectId | undefined
    labId: Schema.Types.ObjectId | undefined
    vtmNumber?: String
    paymentType: PAYMENT_TYPE | undefined
    commissionType: COMMISSION_TYPE | undefined
    commissionValue: number = 0
    extraAmountIfNotCard: number = 0
    amount: number = 0

}


class AppointmentDTO extends BaseDTO {
    symptoms: SYMPTOMS[] = []
    appointmentId: number | undefined = undefined
    vehicle: Schema.Types.ObjectId | undefined = undefined
    startTime: Date | undefined = undefined
    endTime: Date | undefined = undefined
    slot: Schema.Types.ObjectId | undefined = undefined
    covidTestCause: CAUSES | undefined = undefined
    airlineName: string = ""
    flightDate: Date | undefined = undefined
    destination: string | undefined = undefined
    isHidden: boolean = false
    isNewForBooking: boolean = false
    forCovidVaccination: boolean | undefined = undefined
    subService: TestDTO[] = []
    user: Schema.Types.ObjectId | undefined = undefined
    customerType: CUSTOMER_TYPE | undefined = undefined
    branch: Schema.Types.ObjectId | undefined = undefined
    doctor: Schema.Types.ObjectId | undefined = undefined
    time: Date | undefined = undefined
    initialDate: Date | undefined = undefined
    status: STATUS | undefined = undefined
    vaccinationNumber: string | undefined = undefined
    vaccination: Schema.Types.ObjectId | undefined = undefined
    expiresAt: Date | undefined = undefined
    collectionDate: Date | undefined = undefined
    appointmentFor: APPOINTMENT_FOR | undefined = undefined
    vat: number = 0
    price: number = 0
    commissionPaid: number = 0
    commissionPending: number = 0
    discount: number = 0
    paymentTypes: {
        paymentType: PAYMENT_TYPE,
        commissionType: COMMISSION_TYPE
        commissionValue: number
        extraAmountIfNotCard: number
        amount: number;
    }[] = []
    lat: number = 0
    lng: number = 0
    address: string = ""
    addressTwo: string = ""
    lab: Schema.Types.ObjectId | undefined = undefined;
    vendor: Schema.Types.ObjectId | undefined = undefined;
    labId: string | undefined = undefined;
    vtmNumber: string | undefined = undefined;
    hosanId: string | undefined = undefined
    consentFormUrl: string[] = []
    vendorId: string | undefined = undefined
    travelHistory: string | undefined = undefined
    members: Schema.Types.ObjectId | undefined[] = []
    zone: Schema.Types.ObjectId | undefined = undefined
    booking: Schema.Types.ObjectId | undefined = undefined
    initialSubService: Schema.Types.ObjectId | undefined = undefined
    initialPrice: number = 0
    initialExtraAmountIfNotCard: number = 0
    mrNumber: string | undefined = undefined
    remarks: {
        admin: Schema.Types.ObjectId | undefined,
        vehicle: Schema.Types.ObjectId | undefined,
        remarks: String
    }[] = []
    history: {
        flightDate: Date,
        destination: string
    }[] = []
    initialCommissionType: COMMISSION_TYPE | undefined = undefined
    initialCommissionValue: number | undefined = undefined
    initialPaymentType: INITIAL_PAYMENT_TYPE | undefined = undefined
    changeCount: number | undefined = undefined
    admin: Schema.Types.ObjectId | undefined = undefined
    bookingId: string | undefined = undefined
    appointmentTime: Date | undefined = undefined
    bdo: Schema.Types.ObjectId | undefined = undefined
    region: Schema.Types.ObjectId | undefined = undefined
    labCharges: number = 0
    cancelBy: Schema.Types.ObjectId | undefined = undefined
    isClear: boolean = false
    type: TYPE | undefined = undefined
    coordinate: {
        lat: number,
        lng: number
    } = { lat: 0, lng: 0 }
}

export default AppointmentDTO;

export { TestDTO }