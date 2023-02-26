import mongoose from "mongoose";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
import VendorDTO from "../../models/dto-models/vendor.dto";
import IRepository from "./irepository";

/**
 * Vendor Interface
 */
export default interface IVendorRepository extends IRepository<VendorDTO> {
    getComissionByVidAndTids(params: { vendorId: string, paymentType: string, testIds: mongoose.Types.ObjectId[] }): Promise<CommissionCalculateDTO[]> 

    getAllVendor(query: Partial<VehicleDTO>, pagination: BaseQueryDTO): Promise<ListDTO<any[]>> 

    getAllSubService(query: Object): Promise<any[]> 
}