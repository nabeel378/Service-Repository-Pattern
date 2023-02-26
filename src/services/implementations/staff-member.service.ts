import { inject, injectable } from "inversify";
import md5 from "md5";
import mongoose from "mongoose";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ForbiddenError, InternalError } from "../../errors/app.error";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import StaffMemberDTO from "../../models/dto-models/staff-member.dto";
import IStaffMemberRepository from "../../repositories/interfaces/istaff-member.repository";
import IVehicleRepository from "../../repositories/interfaces/ivehicle.repository";
import StaticStringKeys from "../../utils/constant";
import { ResponseModel } from "../../utils/responsemodel";
import IStaffMemberService from "../interfaces/istaff-member.service";

@injectable()
class StaffMemberService implements IStaffMemberService {
  constructor(
    @inject(SERVICE_IDENTIFIER.StaffMemberRepository) private staffMemberRepository: IStaffMemberRepository,
    @inject(SERVICE_IDENTIFIER.VehicleRepository) private vehicleRepository: IVehicleRepository,

  ) { }

  async create(staffMemberArg: StaffMemberDTO): Promise<ResponseModel<StaffMemberDTO>> {
    const response = new ResponseModel<StaffMemberDTO>();

    let {
      firstName,
      lastName,
      dob,
      phone,
      gender,
      email,
    } = staffMemberArg
    if (!phone)
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)

    let check = await this.staffMemberRepository.findOne({ isHidden: false, phone })

    if (check) {
      throw new ForbiddenError("User already exists")
    }

    let password = md5(email!)

    //@ts-ignore
    const result = await this.staffMemberRepository.create({
      // staffGroup,
      firstName,
      lastName,
      dob,
      phone,
      gender,
      email,
      password,
      isHidden: false,
    })
    if (result) {
      response.setSuccessAndData(result, StaticStringKeys.SUCCESSFULL_SAVE)
    } else {
      throw new InternalError(StaticStringKeys.FAILED_TO_SAVE)
    }

    return response;
  }

  async update(updateDTO: StaffMemberDTO): Promise<ResponseModel<StaffMemberDTO>> {
    const response = new ResponseModel<StaffMemberDTO>();

    let {
      _id,
      firstName,
      lastName,
      dob,
      phone,
      gender,
      email,
   
    } = updateDTO

    let password = md5(email!)

    await this.staffMemberRepository.update(
      { _id },
      {
        // staffGroup,
        firstName,
        lastName,
        dob,
        phone,
        gender,
        email,
        password,
      })

    response.setSuccess(StaticStringKeys._UPDATE_SUCCESSFUL("staff member"))
    return response
  }


  async getAll(baseQuery: BaseQueryDTO, arg2: { staffGroup: string, searchQueryText: string }): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>();
    let searchQueryText = arg2.searchQueryText;
    let staffGroup = arg2.staffGroup
    //@ts-ignore
    let skip;
    let limit = 10;
    let page = 1;
    if (!baseQuery.page) {
      skip = 0;
      limit = Number.MAX_SAFE_INTEGER;
    } else {
      skip = (Number(page) * Number(limit)) - Number(limit);
    }
    let query = {
      isHidden: false
    } as any

    if (searchQueryText) {
      query['$text'] = { '$search': searchQueryText } as any
    }
    if (staffGroup) {
      query.staffGroup = new mongoose.Types.ObjectId(staffGroup)
    }

    let staffMembers = await this.staffMemberRepository.getAllStaffMember(query, { page: page, limit: limit, skip: skip }) as any

    [staffMembers] = staffMembers;
    if (staffMembers.metaData.length === 0) {
      staffMembers.metaData = {
        totalDocuments: 0,
        page,
        limit,
      };
    } else {
      [staffMembers.metaData] = staffMembers.metaData;
    }
    response.setSuccessAndData(staffMembers)
    return response
  }

  async getAllStaffForVehicle(): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>();

    let data = await this.vehicleRepository.getAllStaffForVehicle();
    response.setSuccessAndData(data)
    return response
  }


  async deleteStaff(_id: string) {
    const response = new ResponseModel<any>();
      if (!_id)
        throw new ForbiddenError(StaticStringKeys.DATA_MISSED)

      await this.staffMemberRepository.update({ _id: _id }, { isHidden: true });
      response.setSuccess(StaticStringKeys.DELETED_SUCCESSFUL("staff member"))
    return response
  }
}

export default StaffMemberService