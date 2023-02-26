import mongoose from "mongoose";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import LabDTO from "../../models/dto-models/lab.dto";
import IRepository from "./irepository";

/**
 * Lab Interface
 */
export default interface ILabRepository extends IRepository<LabDTO> {

    isLabTestOffered(arg0: { labIds: mongoose.Types.ObjectId[], testIds: mongoose.Types.ObjectId[] }): Promise<{ isValid: boolean, totalPrice: number }>

    getAllLab(query: Partial<LabDTO>, paginateOption: BaseQueryDTO): Promise<any[]>

    getAllLabSubService(query: Partial<LabDTO>): Promise<any[]> 
}