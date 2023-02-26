import { Types } from "mongoose";
import { STATUS } from "../../enums/appointment.enum";
import AdminDTO from "./admin.dto";
import AppointmentDTO from "./appointment.dto";
import SlotDTO from "./slot.dto";
import VendorDTO from "./vendor.dto";

class DownloadCSVBookingDTO {
    status: STATUS | undefined = undefined
    hasana: string = "";
    startTime: string | Date | undefined = undefined;
    endTime: string | Date | undefined = undefined;
    vendor: string | undefined = undefined;
    slot = {} as {
        endTime: Date
        startTime: Date
    };
    zone: string | undefined = undefined;
    bookingId: string | undefined = undefined;
    vehicle: string | undefined = undefined;
    subServices: string[] | undefined = undefined
}

class DownloadCSVBookingQuery {
    subService: Object | undefined = undefined
    status: Object | string | undefined = undefined
    hosanId: Object | string | undefined = undefined
    vehicle: Object | string | undefined = undefined
    vendor: Types.ObjectId | undefined = undefined;
    time = {} as { $gte: Date; $lte: Date }
    startTime: Date | undefined = undefined;;
    endTime: Date | undefined = undefined;
    zone: Types.ObjectId | undefined = undefined;
    bookingId: string | undefined = undefined;
}


class DownloadCSVAppointmentQuery {
    subService: Object | undefined = undefined
    status: Object | string | undefined = undefined
    hosanId: Object | string | undefined = undefined
    vehicle: Object | string | undefined = undefined
}



interface DownloadCSVAppointmentAggregation {
    "_id": string | Types.ObjectId,
    "subService": Object,
    "members": any[],
    "lat": number
    "lng": number
    "status": string
    "extraAmountIfNotCard": number
    "firstName": string
    "noOfAppointments": number
    "email": string
    "phone": string
    "paymentType": string
    "address": string
    "addressTwo": string
    "vendor": VendorDTO
    "vendorId": "2222",
    "zone": Object
    "slot": SlotDTO
    "startTime": Date
    "endTime": Date
    "customerType": "HOME_SAMPLE",
    "vat": number
    "price": number
    "password": string
    "initialPaymentType": string
    "admin": AdminDTO
    "region": string | Types.ObjectId,
    "bdo": string | Types.ObjectId,
    "time": Date
    "appointmentTime": Date
    "initialSubServices": any[]
    "remarks": any[]
    "bookingId": string
    "__v": number
    "vehicle": VendorDTO
    "appointments": AppointmentDTO[]
}

export {DownloadCSVAppointmentAggregation, DownloadCSVAppointmentQuery, DownloadCSVBookingQuery }
export default DownloadCSVBookingDTO;