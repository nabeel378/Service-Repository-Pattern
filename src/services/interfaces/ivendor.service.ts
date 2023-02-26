import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import VendorDTO from "../../models/dto-models/vendor.dto";
import { ResponseModel } from "../../utils/responsemodel";

/**
 * Vendor Interface
 */
export default interface IVendorService {
   
    create(vendorDTO: VendorDTO, filesObj: any): Promise<ResponseModel<VendorDTO>> 

    update(vendorDTO: VendorDTO, filesObj: any): Promise<ResponseModel<VendorDTO>> 

    getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<Array<VendorDTO>>>>

    deleteVendor(_id: string): Promise<ResponseModel<{}>>

    createSubservicesForVendor(subServiceDTO: { vendor: string, subServices: any[] }): Promise<ResponseModel<any>>

    getAllSubservices(vendor: string): Promise<ResponseModel<any[]>> 

    deleteSubService(arg0: { _id: string, subService: string }) :Promise<ResponseModel<any>>

    updateSubService(subServiceDTO: { vendor: any, subService: any, commission: any, commissionValue: any, price: any }): Promise<ResponseModel<{}>> 
}