import { inject, injectable } from "inversify";
import md5 from "md5";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ForbiddenError } from "../../errors/app.error";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import VehicleLoginDTO from "../../models/dto-models/vehicle.login.dto";
import IVehicleRepository from "../../repositories/interfaces/ivehicle.repository";
import StaticStringKeys from "../../utils/constant";
import { ResponseModel } from "../../utils/responsemodel";
import { STATUS } from "../../enums/vehicle.enum"
import IVehicleService from "../interfaces/ivehicle.service";
import INotificationRepository from "../../repositories/interfaces/inotification.repository";
import { ROLES } from "../../enums/defaults.enum";
const jwt = require('jsonwebtoken');

@injectable()
class VehicleService implements IVehicleService {
  constructor(
    @inject(SERVICE_IDENTIFIER.VehicleRepository) private vehicleRepository: IVehicleRepository,
    @inject(SERVICE_IDENTIFIER.NotificationRepository) private notificationRepository: INotificationRepository,
  ) { }

  async findById(adminId: string): Promise<ResponseModel<VehicleDTO>> {
    const response = new ResponseModel<VehicleDTO>()
    const result = await this.vehicleRepository.findById(adminId)
    response.setSuccessAndData(result)
    return response
  }

  async deleteVehicle(arg0: { _id: string }): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>()
    let { _id } = arg0;

    if (!_id) {
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)
    }
    let isDeleted = await this.vehicleRepository.update({ _id: _id }, { isHidden: true });
    if (isDeleted) {
      let zone = await this.vehicleRepository.findOne({ _id: _id });
      response.setSuccess(`${zone.firstName} is deleted`)
    } else {
      response.setError(StaticStringKeys.FAILED_TO_DELETE)
    }
    return response
  }


  async create(vehicleDTO: VehicleDTO): Promise<ResponseModel<VehicleDTO>> {
    const response = new ResponseModel<VehicleDTO>()

    let { firstName, lastName = '', phone, password, email, gender, dob } = vehicleDTO;

    if (!firstName || !phone || !password)
      throw new Error("Data Not provided")

    email = email.toLowerCase()

    let check = await this.vehicleRepository.findOne({ phone })

    if (check) {
      throw new Error(`user is already exists`)
    }

    password = md5(password)

    let vehicle = new VehicleDTO();
    vehicle = Object.assign(vehicle, {
      firstName, lastName, phone, password, email, gender, dob, location: {
        type: 'Point',
        coordinates: [0, 0]
      },
    })
    let data = await this.vehicleRepository.create(vehicle)
    response.setSuccessAndData(data)
    return response
  }

  async getAll(baseQuery: BaseQueryDTO, searchQueryText: string): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let query = {
      isHidden: false
    } as { [key: string]: any }
    let { page = 1, limit = 50 } = baseQuery

    let paginateOption = {} as BaseQueryDTO

    if (page) {
      paginateOption.page = Number(page)
      paginateOption.limit = Number(limit)
    }

    if (searchQueryText) {
      query['$text'] = { '$search': searchQueryText } as any
    }

    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    let data = await this.vehicleRepository.getAllVehicle(query, start, end, paginateOption)

    response.setSuccessAndData(data);
    return response
  }

  async update(vehicleDTO: VehicleDTO): Promise<ResponseModel<VehicleDTO>> {
    const response = new ResponseModel<VehicleDTO>();
    let { _id, firstName, lastName, email, status, phone, gender, dob, password } = vehicleDTO

    if (!_id || !firstName || !email)
      throw new ForbiddenError(StaticStringKeys.DATA_MISSED)

    let query = {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dob,
    } as VehicleDTO;

    if (status) query.status = status
    if (password) query.password = md5(password)

    const result = await this.vehicleRepository.update({ _id }, query);
    if (result) {
      response.setSuccessAndData(result)
    } else {
      response.setError(StaticStringKeys.FAILED_TO_UPDATE)
    }
    return response
  }

  async login(vehicleLoginDTO: VehicleLoginDTO): Promise<ResponseModel<{ token: string; }>> {
    const response = new ResponseModel<{ token: string }>()
    let { phone, password, notificationToken, status = STATUS.ACTIVE } = vehicleLoginDTO

    password = md5(password!)
    let VehicleRegistrationCheck = await this.vehicleRepository.findOne({ phone, status }, 'password')
    console.log(VehicleRegistrationCheck)
    if (!VehicleRegistrationCheck)
      throw new ForbiddenError(StaticStringKeys.USER_NOT_REGISTER)

    if (VehicleRegistrationCheck.password !== password) {
      throw new ForbiddenError(StaticStringKeys.INVALID_PASSWORD)
    }
    delete VehicleRegistrationCheck.password

    if (notificationToken) {
      await this.notificationRepository.create({
        user: VehicleRegistrationCheck._id,
        token: notificationToken,
        userType: ROLES.VEHICLE
      })
    }

    const token = jwt.sign({ id: VehicleRegistrationCheck._id, role: ROLES.VEHICLE }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    response.setSuccessAndData({ token: token })
    return response
  }

  async get (vehicleDTO: VehicleDTO): Promise<ResponseModel<VehicleDTO>> {
    const response = new ResponseModel<VehicleDTO>();
    let { _id } = vehicleDTO

    let data = await this.vehicleRepository.getVehicleById(_id);
    response.setSuccessAndData(data[0])
    return response
  }

  async setAvailibility(isAvailable: boolean, vehicleDTO: VehicleDTO): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();
    let { _id } = vehicleDTO
    await this.vehicleRepository.update({ _id }, { isAvailable });

    response.setSuccess(StaticStringKeys.SUCCESSFULL_UPDATE)
    return response
  }



  async logout(notificationToken: string): Promise<ResponseModel<{}>> {
    const response = new ResponseModel<{}>();
    await this.notificationRepository.hardDelete({ token: notificationToken })
    response.setSuccess(StaticStringKeys.DELETED_SUCCESSFUL("notification token"))
    return response
  }
}

export default VehicleService