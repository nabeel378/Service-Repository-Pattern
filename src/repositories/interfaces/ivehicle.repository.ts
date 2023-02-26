import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import IRepository from "./irepository";

/**
 * Vehicle Interface
 */
export default interface IVehicleRepository extends IRepository<VehicleDTO> {
    getAllVehicle(query: Partial<VehicleDTO>, start: Date | string, end: Date | string, baseQuery: BaseQueryDTO): any

    getVehicleById(_id: string):Promise<VehicleDTO[]>

    getAllStaffForVehicle(): Promise<any[]> 
}