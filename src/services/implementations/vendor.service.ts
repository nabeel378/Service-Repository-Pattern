import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ResponseModel } from "../../utils/responsemodel";
import IVendorService from "../interfaces/ivendor.service";
import VendorDTO from "../../models/dto-models/vendor.dto";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";
import StaticStringKeys from "../../utils/constant";
import IVendorRepository from "../../repositories/interfaces/ivendor.repository";
import { multipartFileUpload } from "../../utils/imageupload";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import mongoose from "mongoose";

@injectable()
class VendorService implements IVendorService {
    constructor(
        @inject(SERVICE_IDENTIFIER.VehicleRepository)
        private vendorRepository: IVendorRepository,
    ) { }


    async create(vendorDTO: VendorDTO, filesObj: any): Promise<ResponseModel<VendorDTO>> {
        const response = new ResponseModel<VendorDTO>();
        let { name, companyName, phone, managerName, address, bdo, vat, inHouse, commissionPaidTo, extraAmountIfNotCard } = vendorDTO
        if (!name) {
            throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
        }
        //@ts-ignore
        inHouse = (inHouse === "true") ? true : false

        name = name.toLowerCase()

        if (inHouse) {
            let check = await this.vendorRepository.findOne({ inHouse })
            if (check) {
                throw new ForbiddenError("You already have a vendor within house")
            }
        }

        let check = await this.vendorRepository.findOne({ name });
        if (check) {
            throw new ForbiddenError("Duplication in vendor is not allowed")
        }
        let data = await this.vendorRepository.create({
            name, companyName, phone, managerName, address, bdo, vat, inHouse, commissionPaidTo, extraAmountIfNotCard,
            isHidden: false,
            totalEarned: 0,
            totalReceived: 0,
            totalCommissionEarned: 0,
            totalCommissionPaid: 0,
            recordUrls: [],
            subServicesOffered: [],
            branch: undefined
        })

        let filess
        if (filesObj && filesObj.vendorRecords) {
            filess = filesObj && filesObj.vendorRecords && filesObj.vendorRecords.length ? filesObj.vendorRecords : [filesObj.vendorRecords]
        }
        if (filess) {
            let files = filess.map((file: { mimetype: string; data: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), data._id))
            let recordUrls = await Promise.all(files);
            await this.vendorRepository.update({ _id: data._id }, { recordUrls });
        }
        response.setSuccess(StaticStringKeys.CREATED_SUCCESSFUL("vendor"))
        return response
    }

    async update(vendorDTO: VendorDTO, filesObj: any): Promise<ResponseModel<VendorDTO>> {
        const response = new ResponseModel<VendorDTO>();

        let { _id, name, companyName, phone, managerName, address, bdo, vat, extraAmountIfNotCard } = vendorDTO
        if (!_id) {
            throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
        }
        let vendorData = await this.vendorRepository.findOne({ _id: _id });
        if(!vendorData){
          throw new NotFoundError(StaticStringKeys.NOT_FOUND("vendor"))
        }
        await this.vendorRepository.update({ _id }, { name, companyName, phone, managerName, address, bdo, vat, extraAmountIfNotCard });

        let filess
        if (filesObj && filesObj.vendorRecords) {
            filess = filesObj && filesObj.vendorRecords && filesObj.vendorRecords.length ? filesObj.vendorRecords : [filesObj.vendorRecords]
        }

        if (filess) {
            let files = filess.map((file: { mimetype: string; data: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), _id))
            let recordUrls = await Promise.all(files);
            await this.vendorRepository.update({ _id }, { recordUrls });
        }
        response.setSuccess(StaticStringKeys._UPDATE_SUCCESSFUL("vendor"))
        return response
    }

    async getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<Array<VendorDTO>>>> {
        const response = new ResponseModel<ListDTO<Array<VendorDTO>>>()

        let paginateOption = {} as BaseQueryDTO

        if (baseQuery.page) {
            paginateOption.page = Number(baseQuery.page)
            paginateOption.limit = Number(baseQuery.limit)
        }
        let query = {
            "isHidden": false
        } as any
        if (searchQueryText) {
            query['$text'] = { '$search': searchQueryText }
        }
        let vendors = await this.vendorRepository.getAllVendor(query, paginateOption)
        response.setSuccessAndData(vendors)
        return response
    }

    async deleteVendor(_id: string): Promise<ResponseModel<{}>> {
        const response = new ResponseModel<{}>()
        if (!_id) {
            throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
        }
        await this.vendorRepository.update({ _id }, { isHidden: true });
        let vendor = await this.vendorRepository.findOne({ _id });
        response.setSuccess(`${vendor.name} is deleted`)
        return response
    }

    private checkSubServiceAndCreate(obj: { _id: string; price?: any; commission?: any; commissionValue?: any; }, previousSubServices: any[]) {
        return new Promise(async (resolve, reject) => {
            let { _id } = obj
            let checkPrevious = previousSubServices.find(obj => String(obj.subService) === String(_id))
            if (checkPrevious) {
                reject({ message: "You can't assign a sub Service twice" })
            }
            let payload = {
                subService: obj._id,
                price: obj.price,
                commission: {
                    type: obj.commission,
                    value: obj.commissionValue
                },
                // extraAmountIfNotCard: obj.extraAmountIfNotCard
                extraAmountIfNotCard: 0
            }
            resolve(payload)

        })
    }
    async createSubservicesForVendor(subServiceDTO: { vendor: string, subServices: any[] }): Promise<ResponseModel<any>> {
        const response = new ResponseModel<any>();
        let { vendor, subServices } = subServiceDTO
        let vendorData = await this.vendorRepository.findOne({ _id: vendor });
        if(!vendorData){
          throw new NotFoundError(StaticStringKeys.NOT_FOUND("vendor"))
        }
        if (subServices && subServices.length) {

            let previousSubServices = vendorData.subServicesOffered ? vendorData.subServicesOffered : []
            let updatArray: any[] = []

            subServices.forEach((obj) => {
                updatArray.push(this.checkSubServiceAndCreate(obj, previousSubServices))
            });
            let finalsubServices = await Promise.all(updatArray);
            await this.vendorRepository.update({ _id: vendor }, { $push: { subServicesOffered: { $each: finalsubServices } } });
            response.setSuccess("Vendor sub services successfully updated")
            return response
        }

        response.setSuccess("Vendor sub services successfully updated")

        return response
    }


    async getAllSubservices(vendor: string): Promise<ResponseModel<any[]>> {
        const response = new ResponseModel<any>();

        if (!vendor) {
            throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
        }
        let query = {
            "isHidden": false,
            _id: new mongoose.Types.ObjectId(vendor)
        }
        let vendors = await this.vendorRepository.getAllSubService(query)
        if (vendors[0].subServicesOffered && vendors[0].subServicesOffered.length) {
            response.setSuccessAndData(vendors[0].subServicesOffered)
            return response
        }
        response.setError("This vendor is not offering any sub service")

        return response
    }

    async deleteSubService(arg0: { _id: string, subService: string }) {
        const response = new ResponseModel<any>();
        let { _id, subService } = arg0

        await this.vendorRepository.update({ _id }, { $pull: { subServicesOffered: { subService: subService } } });

        response.setSuccess("subService is deleted successfully")
        return response;
    }

    async updateSubService(subServiceDTO: { vendor: any, subService: any, commission: any, commissionValue: any, price: any }): Promise<ResponseModel<{}>> {
        const response = new ResponseModel<{}>();
        let { vendor, subService, commission, commissionValue, price } = subServiceDTO
        let vendorData = await this.vendorRepository.findOne({ _id: vendor });
        if(!vendorData){
          throw new NotFoundError(StaticStringKeys.NOT_FOUND("vendor"))
        }
        let commissionPayload = {
            type: commission,
            value: commissionValue
        }
        await this.vendorRepository.update({ _id: vendor, "subServicesOffered.subService": subService }, { $set: { "subServicesOffered.$.extraAmountIfNotCard": 0, "subServicesOffered.$.commission": commissionPayload, "subServicesOffered.$.price": price } });

        response.setSuccess("subService is updated successfully");
        return response
    }


}

export default VendorService