import { inject, injectable } from "inversify";
import { BadRequestError, ConflictRequestError, InternalError, NotFoundError } from "../../errors/app.error";
import SERVICE_IDENTIFIER from "../../../identifiers";
import AdminDTO from "../../models/dto-models/admin.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import BDODTO from "../../models/dto-models/bdo.dto";
import ListDTO from "../../models/dto-models/list.dto";
import IBdoRepository from "../../repositories/interfaces/ibdo.repository";
import StaticStringKeys from "../../utils/constant";
import { DataCopier } from "../../utils/datacopier";
import { ResponseModel } from "../../utils/responsemodel";
import IBdoService from "../interfaces/ibdo.service";
const mongoose = require('mongoose');

@injectable()
class BdoService implements IBdoService {
  constructor(
    @inject(SERVICE_IDENTIFIER.BdoRepository)
    private BdoRepository: IBdoRepository,
  ) { }


  findById(BdoId: string): Promise<ResponseModel<BDODTO>> {
    throw new Error("Method not implemented.");
  }


  async create(bdoArg: BDODTO): Promise<ResponseModel<BDODTO>> {
    const response = new ResponseModel<BDODTO>();
    const IsEmailExist = await this.BdoRepository.findOne({ email: bdoArg.email });
    if (IsEmailExist) {
      throw new ConflictRequestError(StaticStringKeys.EMAIL_IS_ALREADY_REGISTER)
    }
    bdoArg.email = bdoArg.email.toLowerCase();

    const bdo = new BDODTO()
    const entity = DataCopier.copy(bdo, bdoArg);
    const result = await this.BdoRepository.create(entity)
    if (result) {
      response.setSuccessAndData(result, StaticStringKeys.SUCCESSFULL_SAVE)
    } else {
      throw new InternalError(StaticStringKeys.FAILED_TO_SAVE)
    }
    return response
  }


  async getAll(BaseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<BDODTO>>> {
    const response = new ResponseModel<ListDTO<BDODTO>>();
    const BaseQueryObj = new BaseQueryDTO()
    BaseQuery = DataCopier.copy(BaseQueryObj, BaseQuery)

    const QUERY: { name?: Object | string } = {};
    if (searchQueryText) {
      QUERY["name"] = { $regex: searchQueryText, "$options": "i" }
    }
    const bdos = await this.BdoRepository.getAllWithPaginated(QUERY, BaseQuery)
    response.setSuccessAndData(bdos)
    return response
  }

  async update(bdoArg: BDODTO): Promise<ResponseModel<BDODTO>> {
    const response = new ResponseModel<BDODTO>();
    if(!mongoose.isValidObjectId(bdoArg._id)){
      throw new BadRequestError("Invalid _id")
    }
    let bdo = await this.BdoRepository.findOneById(bdoArg._id)

    if (!bdo) {
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("User"));
    }

    if (bdo.email !== bdoArg.email) {
      const IsEmailExist = await this.BdoRepository.findOne({ email: bdoArg.email });
      if (IsEmailExist) {
        throw new ConflictRequestError(StaticStringKeys.EMAIL_IS_ALREADY_REGISTER)
      }
    }

    bdo = DataCopier.copy(bdo, bdoArg)

    const entity: AdminDTO = DataCopier.copy(bdo, bdoArg)
    const result = await this.BdoRepository.update({ _id: bdoArg._id }, entity)
    if (result) {
      response.setSuccessAndData(result)
    } else {
      response.setError(StaticStringKeys.FAILED_TO_SAVE)
    }
    return response
  }

  async deleteBdo(_id:string): Promise<ResponseModel<{}>>{
    const response = new ResponseModel<{}>();
    const isDeleted = await this.BdoRepository.softDelete(new mongoose.Types.ObjectId(_id));
    if(isDeleted){
      response.setSuccess("Successfull deleted")
    }else{
      throw new InternalError("Failed to delete")
    }
    return response
  }
}

export default BdoService