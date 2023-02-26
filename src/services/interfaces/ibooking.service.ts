import AdminDTO from "../../models/dto-models/admin.dto";
import CreateBookingDTO from "../../models/dto-models/booking.create.dto";
import BookingDTO from "../../models/dto-models/booking.dto";
import CreateConsentDTO from "../../models/dto-models/consent.create.dto";
import ListDTO from "../../models/dto-models/list.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import { ResponseModel } from "../../utils/responsemodel";
import { STATUS } from "../../enums/appointment.enum";
import CreateBookingWalkInDTO from "../../models/dto-models/booking.walkin.create.dto";
import DownloadCSVBookingDTO, { DownloadCSVAppointmentAggregation } from "../../models/dto-models/booking.downloadcsv.dto";

export default interface IBookingService {
    create(bookingDTO: CreateBookingDTO, adminDTO: AdminDTO): Promise<ResponseModel<BookingDTO>>

    getAll(query: { page: number, limit: number, search: string, BookingId: string, [key: string]: any }, apiName?: string): Promise<ResponseModel<ListDTO<unknown>>>

    consentForm(consentFormDTO: CreateConsentDTO, files: any): Promise<ResponseModel<any>>

    assignTeamMember(assignTeamMemberDTO: { _id: string, members: string, vehicle: string }): Promise<ResponseModel<unknown>>

    update(bookingDTO: BookingDTO): Promise<ResponseModel<BookingDTO>>

    cancelBooking(cancelDTO: { _id: string, remarks: string }, adminDTO: AdminDTO, vehicleDTO: VehicleDTO): Promise<ResponseModel<BookingDTO>>

    getBookingsForVehicle(bookingDTO: { status: STATUS[] }, vehicleDTO: VehicleDTO): Promise<ResponseModel<any>>

    changeStatus(query: { _id: string, status: string, remarks: string }, adminDTO: AdminDTO, vehicleDTO: VehicleDTO): Promise<ResponseModel<any>>

    getAllUnassignedForGodsEye(unAssignedDTO: { searchQueryText: string }): Promise<ResponseModel<any[]>>

    getBookingById(_id: string): Promise<ResponseModel<any>>

    bookingCreateWalkin(bookignDTO: CreateBookingWalkInDTO, adminDTO: AdminDTO, filesObj: any): Promise<ResponseModel<unknown>>

    addRemarks(remarkDTO: { _id: string, remarks: string }, adminDTO: AdminDTO, vehicleDTO: VehicleDTO): Promise<ResponseModel<any>>

    downloadCsv(downloadCsvDTO: DownloadCSVBookingDTO):Promise<ResponseModel<DownloadCSVAppointmentAggregation[]>> 

}