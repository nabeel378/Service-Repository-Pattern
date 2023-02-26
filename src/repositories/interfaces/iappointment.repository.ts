import AppointmentDTO from "../../models/dto-models/appointment.dto";
import ListDTO from "../../models/dto-models/list.dto";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
import IRepository from "./irepository";

/**
 * Appointment Interface
 */
export default interface IAppointmentRepository extends IRepository<AppointmentDTO> {
    getAllAppointmentWithBooking(appointmentQuery: {}, page: string | number, limit: string | number, skip: string | number): Promise<ListDTO<unknown>>

    getAllTestByBooking(booking: any, appointmentId: any): Promise<any[]>

    updateTest(arg0: {
        paymentTypes: { amount: string | number }[], appointmentId: string, subService: CommissionCalculateDTO[]
    }): Promise<any>

    gitSingleAppointment(_id: string): Promise<any[]>

    getSummary(filterDate: Date | string): Promise<any[]>
}