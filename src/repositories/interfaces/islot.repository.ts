import AppointmentDTO from "../../models/dto-models/appointment.dto";
import SlotDTO from "../../models/dto-models/slot.dto";
import IRepository from "./irepository";

/**
 * Slot Interface
 */
export default interface ISlotRepository extends IRepository<SlotDTO> {
    getAvailableSlot(query:Partial<SlotDTO>,date:string,amount:number):Promise<any[]>

    getSlotMultipleTest(query: Partial<SlotDTO>): Promise<any[]> 

    getCalendorSlot(matchQuery:Partial<SlotDTO>,query:Object,appointmentQuery:Partial<AppointmentDTO>):Promise<any>
}