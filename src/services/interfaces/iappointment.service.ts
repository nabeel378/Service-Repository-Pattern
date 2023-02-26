import AdminDTO from "../../models/dto-models/admin.dto";
import BookingDTO from "../../models/dto-models/booking.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
import { ResponseModel } from "../../utils/responsemodel";

export default interface IAppointmentService {
    create(bookingData: BookingDTO, paymentData: CommissionCalculateDTO): Promise<boolean> 

    subServiceUpdateForAppointmentMutipleTest(serviceDTO: { _id: string, subService: string[], vendor: string }): Promise<ResponseModel<unknown>>

    getSingleAppointment(_id: string): Promise<ResponseModel<any[]>>

    cancelAppointment(arg0: { _id: string }, vehicleDTO: VehicleDTO, adminDTO: AdminDTO):Promise<ResponseModel<unknown>>

    revertBackCancellation(revertBackDTO: { _id: string }): Promise<ResponseModel<unknown>>
    
    updateVTMandLabMultipleTest(body: { _id: string, subService: any[], lab: string }, filesObj: any[]) :any

    appointmentsSummary(summaryDTO: { date: string | Date }): Promise<ResponseModel<any>>
}