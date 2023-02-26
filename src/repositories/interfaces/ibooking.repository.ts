import BookingDTO from "../../models/dto-models/booking.dto";
import IRepository from "./irepository";
import Partial from "../../utils/partial.type"
import { DownloadCSVAppointmentAggregation, DownloadCSVAppointmentQuery, DownloadCSVBookingQuery } from "../../models/dto-models/booking.downloadcsv.dto";
import mongoose from "mongoose";

/**
 * Booking Interface
 */
export default interface IBookingRepository extends IRepository<BookingDTO> {
    getBookingForConsentForm(bookingId: any): Promise<any[]>

    returnDataForConsentForm(bookingId: any): Promise<any>

    getBookingsForVehicle(dataDTO: { _id: string, start: string | Date, end: string | Date }): Promise<any[]>

    getAllUnassignedForGodsEye(queryDTO: { start: string | Date, end: string | Date }): Promise<any[]>

    getBookingById(_id: string): Promise<any[]>

    downloadCSV(bookingQuery: Partial<DownloadCSVBookingQuery>, appointmentQuery: Partial<DownloadCSVAppointmentQuery>): Promise<DownloadCSVAppointmentAggregation[]>

    addSetTest(arg0: { bookingId: mongoose.Types.ObjectId, subServiceId: mongoose.Types.ObjectId[] , appointmentId: string }): Promise<any>

    subServiceUpdateForAppointmentMutiple(bookingId: string): Promise<any[]>
}