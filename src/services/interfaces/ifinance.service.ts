import { ResponseModel } from "../../utils/responsemodel";
import {STATUS} from "../../enums/appointment.enum"
/**
 * Bdo Interface
 */
export default interface IFinanceService {
    bookingCompleteWalkIn(obj: { _id: string, status?: STATUS }): Promise<ResponseModel<unknown>>

    getSalesData(queryDTO: { endDate: string, startDate: string, zone: string }):Promise<any>
    
    getAll (queryDTO:{page: number, limit:number,type: string,startDate: string,endDate:string,admin:string, lab:string, vendor:string, bdo:string, vehicle:string}) :Promise<any>
}