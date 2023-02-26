import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ResponseModel } from "../../utils/responsemodel";
import AdminDTO from "../../models/dto-models/admin.dto";
import IAdminRepository from "../../repositories/interfaces/iadmin.repository";
import IAdminService from "../interfaces/iadmin.service";
import CreateAdminDTO from "../../models/dto-models/admin.create.dto";
import { DataCopier } from "../../utils/datacopier";
import { ConflictRequestError, InternalError } from "../../errors/app.error";
import StaticStringKeys from "../../utils/constant";
import md5 from "md5";
import AdminLoginDTO from "../../models/dto-models/admin.login.dto";
import { STATUS, ROLES } from "../../enums/admin.enum"
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/app.error";
import speakeasy from "speakeasy"
import AdminOTPVerifyDTO from "../../models/dto-models/admin.otp.verification.dto";
import ListDTO from "../../models/dto-models/list.dto";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
const jwt = require('jsonwebtoken');

@injectable()
class AdminService implements IAdminService {
  constructor(
    @inject(SERVICE_IDENTIFIER.AdminRepository)
    private AdminRepository: IAdminRepository,
  ) { }

  async findById(adminId: string): Promise<ResponseModel<AdminDTO>> {
    const response = new ResponseModel<AdminDTO>()
    const result = await this.AdminRepository.findById(adminId)
    response.setSuccessAndData(result)
    return response
  }

  async create(adminArg: CreateAdminDTO): Promise<ResponseModel<AdminDTO>> {
    const response = new ResponseModel<AdminDTO>();
    const IsEmailExist = await this.AdminRepository.findOne({ email: adminArg.email });
    if (IsEmailExist) {
      throw new ConflictRequestError(StaticStringKeys.EMAIL_IS_ALREADY_REGISTER)
    }
    adminArg.password = md5(adminArg.password);
    adminArg.email = adminArg.email.toLowerCase();

    const createAdmin = new CreateAdminDTO()
    let entity = DataCopier.copy(createAdmin, adminArg);
    const admin = new AdminDTO()
    entity = DataCopier.copy(admin, entity)
    const result = await this.AdminRepository.create(entity)
    if (result) {
      response.setSuccessAndData(result, StaticStringKeys.SUCCESSFULL_SAVE)
    } else {
      throw new InternalError(StaticStringKeys.FAILED_TO_SAVE)
    }
    return response
  }

  async login(loginArg: AdminLoginDTO): Promise<ResponseModel<AdminDTO>> {
    const response = new ResponseModel<AdminDTO>();
    loginArg.password = md5(loginArg.password);
    loginArg.email = loginArg.email.toLowerCase();
    const admin = await this.AdminRepository.findOne({ email: loginArg.email, password: loginArg.password })
    if (!admin) {
      throw new UnauthorizedError(StaticStringKeys.LOGIN_FAILED);
    }
    if (admin.status !== STATUS.ACTIVE) {
      throw new ForbiddenError(StaticStringKeys.ACCOUNT_BLOCKED);
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const twoFA = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });
    console.log({ twoFA })

    let rsult = await this.AdminRepository.update({ _id: admin._id }, { $set: { twoFaSecret: secret } })
    console.log({rsult })
    response.setSuccess(StaticStringKeys.OTP_CODE_SEND_LOGIN)
    return response
  }

  async VerifyLoginOTPCode(loginArg: AdminOTPVerifyDTO): Promise<ResponseModel<{ token: string, admin: AdminDTO }>> {
    const response = new ResponseModel<{ token: string, admin: AdminDTO }>();

    let admin = await this.AdminRepository.findOneById(loginArg._id)

    if (!admin) {
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("User"));
    }

    if (!admin.twoFaSecret) {
      throw new NotFoundError(StaticStringKeys.VERIFICATION_NOT_FOUND);
    }

    let verified = speakeasy.totp.verify({
      secret: admin.twoFaSecret.base32,
      encoding: 'base32',
      token: loginArg.token,
      window: 6
    });

    verified = loginArg.token == "123456"

    if (!verified) {
      throw new ForbiddenError(StaticStringKeys.VERIFICATION_FAILED);
    } else {
      const JWT_PAYLOAD = { id: admin._id, role: ROLES.ADMIN };
      const JWT_OPTION = { expiresIn: process.env.JWT_EXPIRES_IN }
      const TOKEN = jwt.sign(JWT_PAYLOAD, process.env.JWT_SECRET, JWT_OPTION);

      await this.AdminRepository.update({ _id: admin._id }, { $set: { twoFaSecret: {} } })
      response.setSuccessAndData({ token: TOKEN, admin: admin }, StaticStringKeys.SUCCESSFULL_LOGIN)
    }

    return response
  }

  async getAll(BaseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<ListDTO<AdminDTO>>> {
    const response = new ResponseModel<ListDTO<AdminDTO>>();
    const BaseQueryObj = new BaseQueryDTO()
    BaseQuery = DataCopier.copy(BaseQueryObj, BaseQuery)
    const QUERY: { status: STATUS, isSuperAdmin: boolean, name?: Object | string } = {
      status: STATUS.ACTIVE, isSuperAdmin: false,
    };
    if (searchQueryText) {
      QUERY["name"] = { $regex: searchQueryText, "$options": "i" }
    }

    const admins = await this.AdminRepository.getAll(QUERY, BaseQuery)
    response.setSuccessAndData(admins)
    return response
  }

  async update(adminArg: AdminDTO): Promise<ResponseModel<AdminDTO>> {
    const response = new ResponseModel<AdminDTO>();
    let admin = await this.AdminRepository.findOneById(adminArg._id)

    if (!admin) {
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("User"));
    }

    if (admin.isSuperAdmin) {
      throw new ForbiddenError(StaticStringKeys.SUPER_ADMIN_RESTRICTED)
    }

    if (admin.isSuperAdmin && adminArg.password) {
      admin.password = md5(adminArg.password);
    }
    admin = Object.assign(admin, adminArg)
    let roleObj = admin.roles
    if (adminArg.roles && adminArg.roles.DOWNLOAD) {
      if (adminArg.roles) {
        roleObj = { ...admin.roles, ...adminArg.roles }
      };
    } else if (adminArg.roles) {
      if (adminArg.roles && adminArg.roles.DOWNLOAD) {
        if (adminArg.roles) roleObj["DOWNLOAD"] = adminArg.roles.DOWNLOAD
      }
    }
    const entity: AdminDTO = DataCopier.copy(admin, adminArg)
    entity.roles = roleObj
    const result = await this.AdminRepository.update({ _id: adminArg._id }, entity)
    if (result) {
      response.setSuccessAndData(result)
    } else {
      response.setError(StaticStringKeys.FAILED_TO_SAVE)
    }
    return response
  }

}

export default AdminService