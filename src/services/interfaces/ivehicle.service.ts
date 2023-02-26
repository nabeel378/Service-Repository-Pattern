import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import VehicleLoginDTO from "../../models/dto-models/vehicle.login.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * Branch Interface
 */
export default interface IVehicleService {
    findById(adminId: string): Promise<ResponseModel<VehicleDTO>>

    getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<unknown>>

    deleteVehicle(arg0: { _id: string }): Promise<ResponseModel<{}>>

    create(vehicleDTO: VehicleDTO): Promise<ResponseModel<VehicleDTO>>

    update(vehicleDTO: VehicleDTO): Promise<ResponseModel<VehicleDTO>>

    login(vehicleLoginDTO: VehicleLoginDTO): Promise<ResponseModel<{ token: string; }>>

    get(vehicleDTO: VehicleDTO): Promise<ResponseModel<VehicleDTO>>

    setAvailibility(isAvailable: boolean, vehicleDTO: VehicleDTO): Promise<ResponseModel<{}>>
}