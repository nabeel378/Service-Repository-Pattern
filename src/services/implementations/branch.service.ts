import { inject, injectable } from "inversify";
import { BadRequestError, InternalError, NotFoundError } from "../../errors/app.error";
import SERVICE_IDENTIFIER from "../../../identifiers";
import AdminDTO from "../../models/dto-models/admin.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import BranchDTO from "../../models/dto-models/branch.dto";
import ListDTO from "../../models/dto-models/list.dto";
import IBranchRepository from "../../repositories/interfaces/ibranch.repository";
import StaticStringKeys from "../../utils/constant";
import { DataCopier } from "../../utils/datacopier";
import { ResponseModel } from "../../utils/responsemodel";
import IBranchService from "../interfaces/ibranch.service";
const mongoose = require('mongoose');

@injectable()
class BranchService implements IBranchService {
  constructor(
    @inject(SERVICE_IDENTIFIER.BranchRepository)
    private BranchRepository: IBranchRepository,
  ) { }


  findById(BranchId: string): Promise<ResponseModel<BranchDTO>> {
    throw new Error("Method not implemented.");
  }


  async create(branchArg: BranchDTO): Promise<ResponseModel<BranchDTO>> {
    const response = new ResponseModel<BranchDTO>();

    const branch = new BranchDTO()
    const entity = DataCopier.copy(branch, branchArg);
    const result = await this.BranchRepository.create(entity)
    if (result) {
      response.setSuccessAndData(result, StaticStringKeys.SUCCESSFULL_SAVE)
    } else {
      throw new InternalError(StaticStringKeys.FAILED_TO_SAVE)
    }
    return response
  }


  async getAll(BaseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<BranchDTO>>> {
    const response = new ResponseModel<ListDTO<BranchDTO>>();
    const BaseQueryObj = new BaseQueryDTO()
    BaseQuery = DataCopier.copy(BaseQueryObj, BaseQuery)

    const QUERY: { name?: Object | string } = {};
    if (searchQueryText) {
      QUERY["name"] = { $regex: searchQueryText, "$options": "i" }
    }
    const branchs = await this.BranchRepository.getAllWithPaginated(QUERY, BaseQuery)
    response.setSuccessAndData(branchs)
    return response
  }

  async update(branchArg: BranchDTO): Promise<ResponseModel<BranchDTO>> {
    const response = new ResponseModel<BranchDTO>();
    if (!mongoose.isValidObjectId(branchArg._id)) {
      throw new BadRequestError("Invalid _id")
    }
    let branch = await this.BranchRepository.findOneById(branchArg._id)

    if (!branch) {
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("User"));
    }

    branch = DataCopier.copy(branch, branchArg)

    const entity: AdminDTO = DataCopier.copy(branch, branchArg)
    const result = await this.BranchRepository.update({ _id: branchArg._id }, entity)
    if (result) {
      response.setSuccessAndData(result)
    } else {
      response.setError(StaticStringKeys.FAILED_TO_SAVE)
    }
    return response
  }

  async deleteBranch(_id: string): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();
    const isDeleted = await this.BranchRepository.softDelete(new mongoose.Types.ObjectId(_id));
    if (isDeleted) {
      response.setSuccess("Successfull deleted")
    } else {
      throw new InternalError("Failed to delete")
    }
    return response
  }
}

export default BranchService