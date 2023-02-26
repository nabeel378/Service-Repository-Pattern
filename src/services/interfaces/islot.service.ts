import SlotDTO from "../../models/dto-models/slot.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * Bdo Interface
 */
export default interface ISlotService {
    /**
     * @param object  dto object
     */

    getAll(slotDTO: SlotDTO): Promise<ResponseModel<any[]>> 
    
    getAllSlotsMultipleTest(): Promise<ResponseModel<any[]>>

    getCalenderData(query: { type: any, date: any, vendor: any, search: any, shift: any, startTime: any, endTime: any }):Promise<ResponseModel<any[]>> 
}