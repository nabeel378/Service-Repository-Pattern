import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import AdminDTO from "../../models/dto-models/admin.dto";
import { CUSTOMER_TYPE, FILTER_TYPE, HASANA_ID_STATUS, INITIAL_PAYMENT_TYPE, PAYMENT_TYPE, STATUS, TEAM_ASSIGN } from "../../enums/appointment.enum";
import financeEnum from "../../enums/finance.enum"
import ISlotRepository from "../../repositories/interfaces/islot.repository";
import IBookingService from "../interfaces/ibooking.service";
import { BadRequestError, ConflictRequestError, ForbiddenError, NotFoundError } from "../../errors/app.error";
import StaticStringKeys from "../../utils/constant";
import IVendorRepository from "../../repositories/interfaces/ivendor.repository";
import IMasterRepository from "../../repositories/interfaces/imaster.repository";
import mongoose, { Types } from "mongoose";
import CreateBookingDTO from "../../models/dto-models/booking.create.dto";
import VendorDTO from "../../models/dto-models/vendor.dto";
import SlotDTO from "../../models/dto-models/slot.dto";
import IBookingRepository from "../../repositories/interfaces/ibooking.repository";
import BookingDTO from "../../models/dto-models/booking.dto";
import IAppointmentService from "../interfaces/iappointment.service";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
import { ResponseModel } from "../../utils/responsemodel";
import { ObjectId, ObjectIdLike } from "bson";
import IUserRepository from "../../repositories/interfaces/iuser.repository";
import moment from "moment"
import _ from "lodash"
import IAppointmentRepository from "../../repositories/interfaces/iappointment.repository";
import ListDTO from "../../models/dto-models/list.dto";
import { COMMISSION_TYPE, SUB_SERVICE_TYPE } from "../../enums/subservice.enum";
import ISubServiceRepository from "../../repositories/interfaces/isubservice.repository";
import { TYPE } from "../../enums/user.enum";
import { multipartFileUpload } from "../../utils/imageupload"
import md5 from "md5";
import numeral from 'numeral';
import CreateConsentDTO from "../../models/dto-models/consent.create.dto";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import FinanceDTO from "../../models/dto-models/finance.dto";
import IFinanceRepository from "../../repositories/interfaces/ifinance.repository";
import IAdminRepository from "../../repositories/interfaces/iadmin.repository";
import CreateBookingWalkInDTO from "../../models/dto-models/booking.walkin.create.dto";
import UserDTO from "../../models/dto-models/user.dto";
import IBranchRepository from "../../repositories/interfaces/ibranch.repository";
import IFinanceService from "../interfaces/ifinance.service";
import DownloadCSVBookingDTO, { DownloadCSVAppointmentAggregation, DownloadCSVAppointmentQuery, DownloadCSVBookingQuery } from "../../models/dto-models/booking.downloadcsv.dto";

@injectable()
class BookingService implements IBookingService {
  constructor(
    @inject(SERVICE_IDENTIFIER.SlotRepository) private slotRepository: ISlotRepository,
    @inject(SERVICE_IDENTIFIER.VendorRepository) private vendorRepository: IVendorRepository,
    @inject(SERVICE_IDENTIFIER.MasterRepository) private masterRepository: IMasterRepository,
    @inject(SERVICE_IDENTIFIER.BookingRepository) private bookingRepository: IBookingRepository,
    @inject(SERVICE_IDENTIFIER.AppointmentService) private appointmentService: IAppointmentService,
    @inject(SERVICE_IDENTIFIER.UserRepository) private userRepository: IUserRepository,
    @inject(SERVICE_IDENTIFIER.AppointmentRepository) private appointmentRepository: IAppointmentRepository,
    @inject(SERVICE_IDENTIFIER.SubServiceRepository) private subServiceRepository: ISubServiceRepository,
    @inject(SERVICE_IDENTIFIER.FinanceRepository) private financeRepository: IFinanceRepository,
    @inject(SERVICE_IDENTIFIER.FinanceService) private financeService: IFinanceService,
    @inject(SERVICE_IDENTIFIER.AdminRepository) private adminRepository: IAdminRepository,
    @inject(SERVICE_IDENTIFIER.BranchRepository) private branchRepository: IBranchRepository,
  ) { }

  async create(bookingDTO: CreateBookingDTO, adminDTO: AdminDTO): Promise<ResponseModel<BookingDTO>> {
    const response = new ResponseModel<BookingDTO>()
    let slotData = new SlotDTO()
    let paymentType: PAYMENT_TYPE = bookingDTO.paymentType
    if (bookingDTO.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
      slotData = await this.slotRepository.findOne({ _id: bookingDTO.slot })
      if (!slotData) {
        throw new ConflictRequestError(StaticStringKeys.INVALID_ID("slot"))
      }
    } else {
      slotData = Object.assign(slotData, { startTime: 0, endTime: 0 })
    }
    let vendorData: VendorDTO = await this.vendorRepository.findOne({ _id: bookingDTO.vendor })
    if (!vendorData) {
      throw new ConflictRequestError(StaticStringKeys.INVALID_ID("vendor"))
    }


    const testIds: any = bookingDTO.subService.map(item => new Types.ObjectId(item))
    if (bookingDTO.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }

    const appointmentTest = await this.vendorRepository.getComissionByVidAndTids({ vendorId: bookingDTO.vendor, paymentType, testIds })
    if (appointmentTest.length != testIds.length) {
      throw new ConflictRequestError(StaticStringKeys.INVALID_ID("test"))
    }
    //Get All TestIds All Person
    let BookingEntity: BookingDTO = {
      address: bookingDTO.address,
      addressTwo: bookingDTO.addressTwo,
      slot: slotData._id,
      branch: vendorData.branch,
      vendor: vendorData._id,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      coordinate: bookingDTO.coordinate,
      lat: bookingDTO.coordinate.lat,
      lng: bookingDTO.coordinate.lng,
      noOfAppointments: bookingDTO.noOfAppointments,
      customerType: bookingDTO.customerType,
      vat: vendorData.vat,
      price: appointmentTest[0].totalAmount * bookingDTO.noOfAppointments,
      password: Math.floor(100000 + Math.random() * 900000).toString(),
      admin: adminDTO._id,
      region: bookingDTO.region ? bookingDTO.region : null,
      bdo: vendorData.bdo,
      bookingId: undefined,
      firstName: bookingDTO.firstName,
      lastName: bookingDTO.lastName,
      phone: bookingDTO.phone,
      email: bookingDTO.email,
      paymentType: paymentType,
      subService: testIds,
      vendorId: bookingDTO.vendorId,
      vehicle: new Types.ObjectId(bookingDTO.vehicle),
      members: [],
      zone: new Types.ObjectId(bookingDTO.zone),
      time: bookingDTO.time,
      status: STATUS.BOOKED,
      initialSubServices: [],
      initialPaymentType: INITIAL_PAYMENT_TYPE.CARD,
      changeCount: 0,
      discount: bookingDTO.discount,
      remarks: [],
      appointmentTime: undefined,
      extraAmountIfNotCard: 0,
      cancelBy: undefined,
      covidTestCause: undefined
    }

    BookingEntity["subService"] = testIds

    if (bookingDTO.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
      BookingEntity["time"] = new Date(bookingDTO.time);

      const slotTime = new Date(slotData.startTime).setHours(slotData.startTime.getHours() + 5)
      BookingEntity["appointmentTime"] = new Date(new Date(bookingDTO.time).toISOString().split('T')[0] + 'T' + new Date(slotTime).toISOString().split('T')[1])
    } else {
      BookingEntity["time"] = new Date()

    }
    if (bookingDTO.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }

    if (bookingDTO.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }

    if (!paymentType) {
      paymentType = PAYMENT_TYPE.CARD
    }
    const bookingData: BookingDTO = await this.bookingRepository.create(BookingEntity)

    let paymentObj = {} as CommissionCalculateDTO;
    if (appointmentTest.length > 0) {
      paymentObj = appointmentTest[0]
    }
    console.log({ bookingData })
    let createAppoinment = await this.appointmentService.create(bookingData, paymentObj)
    if (createAppoinment) {
      response.setSuccessAndData(bookingData, StaticStringKeys.SUCCESSFULL_SAVE)
    }
    const masterData = await this.masterRepository.findOne({});
    let mrNumberPrevious = Number(masterData.mrNumberCount);

    await this.masterRepository.update({}, { mrNumberCount: mrNumberPrevious })
    return response

  }

  /**
   * 
   * @param query 
   * @param apiName is defined this is normal list or urgent list
   * @returns 
   */
  async getAll(query: { page: number, limit: number, search: string, BookingId: string, [key: string]: any }, apiName: string = "normal"): Promise<ResponseModel<ListDTO<unknown>>> {
    const response = new ResponseModel<ListDTO<unknown>>();
    let { search, type, page = 1, limit = 1000, status, hasana, startTime, endTime, vendor, slot, zone, bookingId, vehicle, subServices, customerType, nurse, bdo, cancelBy, } = query;
    let skip;
    if (!page) {
      skip = 0;
      limit = 10;
    } else {
      skip = (Number(page) * Number(limit)) - Number(limit);
    }
    let appointmentQuery: any = {}

    if (subServices && subServices.length) {
      let newArray = subServices.map((_id: string | number | ObjectId | ObjectIdLike | Buffer | Uint8Array | undefined) => {
        return new Types.ObjectId(_id)
      })
      appointmentQuery["subService.subServiceId"] = { $in: newArray }
    }
    if (status && status.length) {
      appointmentQuery.status = { $in: status }
    }

    if (search && type === FILTER_TYPE.EID_PASSPORT) {

      let users = await this.userRepository.find({
        $or: [
          { eid: { $regex: search, $options: "i" } },
          { passportNumber: { $regex: search, $options: "i" } },
        ]
      });

      let usersId = users.map(u => u._id)

      appointmentQuery.user = { $in: usersId };
      // limit = 100
    }

    if (search && type === FILTER_TYPE.PHONE) {

      let users = await this.userRepository.find({
        $or: [
          { phone: { $regex: search, $options: "i" } },
        ]
      });

      let userId = users.map(u => u._id)

      appointmentQuery.user = { $in: userId };
      // limit = 100
    }

    if (search && type === FILTER_TYPE.EMAIL) {

      let users = await this.userRepository
        .find({
          $or: [
            { email: { $regex: search, $options: "i" } },
          ]
        })
      let userId = users.map(u => u._id)

      appointmentQuery.user = { $in: userId };
      // limit = 100
    }

    if (search && type === FILTER_TYPE.NAME) {

      let users = await this.userRepository
        .find({
          $or: [
            { firstName: { $regex: search, $options: "i" } }]
        })
      let userId = users.map(u => u._id)

      appointmentQuery.user = { $in: userId };
      // limit = 100
    }

    if (nurse) {
      nurse = nurse.map((u: string | number | ObjectId | ObjectIdLike | Buffer | Uint8Array | undefined) => new Types.ObjectId(u))
      appointmentQuery.members = { $in: nurse };

    }

    if (search && type === FILTER_TYPE.VENDOR_ID_LAB_ID)
      appointmentQuery['$text'] = { '$search': search }

    if (hasana && hasana === HASANA_ID_STATUS.ENTERED)
      appointmentQuery.hosanId = { $exists: true }

    if (hasana && hasana === HASANA_ID_STATUS.NOT_ENTERED)
      appointmentQuery.hosanId = { $exists: false }

    if (vehicle && vehicle === TEAM_ASSIGN.ASSIGNED)
      appointmentQuery.vehicle = { $exists: true }

    if (vehicle && vehicle === TEAM_ASSIGN.NOT_ASSIGNED)
      appointmentQuery.vehicle = { $exists: false }

    if (customerType)
      appointmentQuery.customerType = customerType

    if (startTime && endTime) {
      let start = new Date(startTime)
      start = moment(start).startOf("day").utc(true).toDate()
      // start.setHours(5, 0, 0, 0);
      let end = new Date(endTime);
      // end.setHours(5, 0, 0, 0);
      end = moment(end).endOf("day").utc(true).toDate()
      appointmentQuery.time = { $gte: new Date(start), $lte: new Date(end) }
    }

    if (vendor) {
      appointmentQuery.vendor = new Types.ObjectId(vendor)
    }
    if (bdo) {
      appointmentQuery.bdo = new Types.ObjectId(bdo)
    }

    if (slot && Object.keys(slot).length) {
      let startTime = slot.startTime
      let endTime = slot.endTime
      appointmentQuery.startTime = new Date(startTime)
      appointmentQuery.endTime = new Date(endTime)
    }

    if (zone) {
      appointmentQuery.zone = new Types.ObjectId(zone)
    }
    if (cancelBy)
      appointmentQuery.cancelBy = new Types.ObjectId(cancelBy)

    if (bookingId) {
      appointmentQuery.bookingId = bookingId
    }

    if (apiName == "urgent") {
      let subServiceIds: any[] = []

      let allUrgentServices = await this.subServiceRepository.find({ serviceType: SUB_SERVICE_TYPE.URGENT }) as any
      allUrgentServices = allUrgentServices.forEach((e: { _id: string | number | ObjectId | ObjectIdLike | Buffer | Uint8Array | undefined; }) => {
        subServiceIds.push(new Types.ObjectId(e._id))
      })

      appointmentQuery.subService = { $in: subServiceIds };
      let newTime = new Date()
      newTime.setHours(newTime.getHours() - 4);

      appointmentQuery.collectionDate = { $lte: newTime }
      appointmentQuery.isClear = Boolean(false)
    }

    let data = await this.appointmentRepository.getAllAppointmentWithBooking(appointmentQuery, page, limit, skip) as any;
    [data] = data
    if (data.metaData.length === 0) {
      data.metaData = {
        totalDocuments: 0,
        page: Number(page),
        limit: Number(limit),
      } as any;
    } else {
      [data.metaData] = data.metaData;
    }
    response.setSuccessAndData(data)
    return response;
  }


  async consentForm(consentFormDTO: CreateConsentDTO, files: any): Promise<ResponseModel<any>> {
    const response = new ResponseModel<any>()
    let { bookingId, password, covidTestCause,
      flightDate, airlineName, destination, symptoms,
      travelHistory, firstName,
      dob, phone, gender, email, eid, passportNumber,
      residentOrVisitor, jobDescription, address,
      companyName, nationality, occupation,
      area,
      institute,
      campName,
      supervisorName,
      supervisorNumber,
      grade,
      officeAddress,
      history,
      paymentType,
      isNewAppointment = false,
      vtmNumber

    } = consentFormDTO
    isNewAppointment = Boolean(isNewAppointment)
    let user;
    let checkBooking = await this.bookingRepository.findOne({ bookingId });
    if (!checkBooking) {
      throw new NotFoundError(StaticStringKeys.NOT_FOUND("booking"))
    }
    if (checkBooking.password !== password) {
      throw new BadRequestError(StaticStringKeys.INVALID_PASSWORD)
    }

    const appointment = await this.appointmentRepository.findOne({ status: { $in: [STATUS.ARRIVED, STATUS.BOOKED, STATUS.EN_ROUTE] }, booking: checkBooking._id, user: { $exists: false } })


    if (!isNewAppointment && !appointment) {

      let data = await this.bookingRepository.getBookingForConsentForm(checkBooking._id)
      response.setErrorAndData({ data: data[0], isNew: true }, StaticStringKeys.NOT_INITIAL_BOOKING_ERROR, 400)
      return response
    }

    if (!paymentType && appointment && appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.UN_PAID) {

      let data = await this.bookingRepository.getBookingForConsentForm(checkBooking._id)

      response.setErrorAndData({ data: data[0], isNew: true }, StaticStringKeys.SELECT_PAYMENT_METHOD, 400)
      return response
    }

    if (appointment && !isNewAppointment && (appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.CASH || appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.CARD || appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.ONLINE_TRANSFER || appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.CREDIT_CARD)) {

      let orQuery = []

      if (eid) {
        orQuery.push({
          eid, type: TYPE.USER
        })
      }

      if (!eid && passportNumber) {
        orQuery.push({
          passportNumber, type: TYPE.USER
        })
      }

      let userCheckAlready = await this.userRepository.findOne({ $or: orQuery });

      let query: any = {
        password: md5("qam_password"),
        dob,
        phone,
        gender,
        type: TYPE.USER,
        residentOrVisitor,
      }
      if (firstName) query.firstName = firstName
      if (nationality) query.nationality = nationality
      if (email) query.email = email.toLowerCase()
      if (passportNumber) query.passportNumber = passportNumber
      if (eid) query.eid = eid
      if (address) query.address = address
      if (checkBooking.addressTwo) query.addressTwo = checkBooking.addressTwo
      if (jobDescription) query.jobDescription = jobDescription
      if (companyName) query.companyName = companyName
      if (occupation) query.occupation = occupation
      if (area) query.area = area
      if (institute) query.institute = institute
      if (campName) query.campName = campName
      if (supervisorName) query.supervisorName = supervisorName
      if (supervisorNumber) query.supervisorNumber = supervisorNumber
      if (grade) query.grade = grade
      if (officeAddress) query.officeAddress = officeAddress

      if (!userCheckAlready) {

        let userData = await this.userRepository.create(query)

        let filess
        if (files && files.idCardImages) {
          filess = files && files.idCardImages && files.idCardImages.length ? files.idCardImages : [files.idCardImages]
        }
        if (filess) {
          let files = filess.map((file: any) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), userData._id))
          let eidImageUrls = await Promise.all(files);
          await this.userRepository.update({ _id: userData._id }, { eidImageUrls });
        }

        user = userData._id
      }

      if (userCheckAlready) {

        await this.userRepository.update({ _id: userCheckAlready._id }, query);
        user = userCheckAlready._id
      }

      let appointmentQuery: any = {
        user
      }

      // appointmentQuery.paymentTypes = [{
      //     paymentType: appointment.initialPaymentType,
      //     amount: appointment.price,
      //     commissionType: appointment.initialCommissionType,
      //     commissionValue: appointment.initialCommissionValue || 0,
      //     extraAmountIfNotCard: appointment.initialExtraAmountIfNotCard
      // }]

      if (covidTestCause) appointmentQuery.covidTestCause = covidTestCause
      if (flightDate) appointmentQuery.flightDate = flightDate
      if (airlineName) appointmentQuery.airlineName = airlineName
      if (destination) appointmentQuery.destination = destination
      if (symptoms) appointmentQuery.symptoms = symptoms
      if (travelHistory) appointmentQuery.travelHistory = travelHistory
      if (vtmNumber) appointmentQuery.vtmNumber = vtmNumber
      if (history) appointmentQuery.history = JSON.parse(history)

      let availableAppointment = await this.appointmentRepository.findOne({ status: { $in: [STATUS.ARRIVED, STATUS.BOOKED, STATUS.EN_ROUTE] }, booking: checkBooking._id, user: { $exists: false } })
      await this.appointmentRepository.update({ _id: availableAppointment._id }, appointmentQuery)

    }


    if (appointment && isNewAppointment && appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.UN_PAID) {
      // console.log("4")

      let orQuery = []

      if (eid) {
        orQuery.push({
          eid, type: TYPE.USER
        })
      }

      if (!eid && passportNumber) {
        orQuery.push({
          passportNumber, type: TYPE.USER
        })
      }

      let userCheckAlready = await this.userRepository.findOne({ $or: orQuery });

      let query: any = {
        password: md5("qam_password"),
        dob,
        phone,
        gender,
        type: TYPE.USER,
        residentOrVisitor,

      }

      if (firstName) query.firstName = firstName
      if (nationality) query.nationality = nationality
      if (email) query.email = email.toLowerCase()
      if (passportNumber) query.passportNumber = passportNumber
      if (eid) query.eid = eid
      if (address) query.address = address
      if (jobDescription) query.jobDescription = jobDescription
      if (checkBooking.addressTwo) query.addressTwo = checkBooking.addressTwo
      if (companyName) query.companyName = companyName
      if (occupation) query.occupation = occupation
      if (area) query.area = area
      if (institute) query.institute = institute
      if (campName) query.campName = campName
      if (supervisorName) query.supervisorName = supervisorName
      if (supervisorNumber) query.supervisorNumber = supervisorNumber
      if (grade) query.grade = grade
      if (officeAddress) query.officeAddress = officeAddress

      if (!userCheckAlready) {

        let userData: any = await this.userRepository.create(query)

        let filess
        if (files && files.idCardImages) {
          filess = files && files.idCardImages && files.idCardImages.length ? files.idCardImages : [files.idCardImages]
        }
        if (filess) {
          let files = filess.map((file: any) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), userData._id))
          let eidImageUrls = await Promise.all(files);
          await this.userRepository.update({ _id: userData._id }, { eidImageUrls });
        }

        user = userData._id
      }

      if (userCheckAlready) {

        await this.userRepository.update({ _id: userCheckAlready._id }, query)
        user = userCheckAlready._id
      }

      let appointmentQuery: any = {
        user,
      }

      // let subServiceData: any = checkBooking.initialSubServices.find(element => String(element.subService) === String(appointment.subService));
      // let subSData = await this.subServiceRepository.findOne({ _id: subServiceData.subService });

      if (paymentType && appointment && appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.UN_PAID) {
        appointmentQuery.paymentTypes = [{
          paymentType: paymentType,
          amount: appointment.price,
          commissionType: appointment.initialCommissionType,
          commissionValue: appointment.initialCommissionValue || 0,
          // extraAmountIfNotCard: (paymentType === INITIAL_PAYMENT_TYPE.CARD || paymentType === INITIAL_PAYMENT_TYPE.PAID) ? 0 : subSData.extraAmountIfNotCard
          extraAmountIfNotCard: 0
        }] as any
        appointmentQuery.initialPaymentType = paymentType
      }

      if (covidTestCause) appointmentQuery.covidTestCause = covidTestCause
      if (flightDate) appointmentQuery.flightDate = flightDate
      if (airlineName) appointmentQuery.airlineName = airlineName
      if (destination) appointmentQuery.destination = destination
      if (symptoms) appointmentQuery.symptoms = symptoms
      if (travelHistory) appointmentQuery.travelHistory = travelHistory
      if (vtmNumber) appointmentQuery.vtmNumber = vtmNumber
      if (history) appointmentQuery.history = JSON.parse(history)

      let availableAppointment = await this.appointmentRepository.findOne({ status: { $in: [STATUS.ARRIVED, STATUS.BOOKED, STATUS.EN_ROUTE] }, booking: checkBooking._id, user: { $exists: false } })
      await this.appointmentRepository.update({ _id: availableAppointment._id }, appointmentQuery);

    }

    if (appointment && appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.PAID) {
      // console.log("5")

      let orQuery = []

      if (eid) {
        orQuery.push({
          eid, type: TYPE.USER
        })
      }

      if (!eid && passportNumber) {
        orQuery.push({
          passportNumber, type: TYPE.USER
        })
      }

      let userCheckAlready = await this.userRepository.findOne({ $or: orQuery })


      let query: any = {
        password: md5("qam_password"),
        dob,
        phone,
        gender,
        type: TYPE.USER,
        residentOrVisitor,

      }
      if (firstName) query.firstName = firstName
      if (nationality) query.nationality = nationality
      if (email) query.email = email.toLowerCase()
      if (passportNumber) query.passportNumber = passportNumber
      if (eid) query.eid = eid
      if (address) query.address = address
      if (jobDescription) query.jobDescription = jobDescription
      if (checkBooking.addressTwo) query.addressTwo = checkBooking.addressTwo
      if (companyName) query.companyName = companyName
      if (occupation) query.occupation = occupation
      if (area) query.area = area
      if (institute) query.institute = institute
      if (campName) query.campName = campName
      if (supervisorName) query.supervisorName = supervisorName
      if (supervisorNumber) query.supervisorNumber = supervisorNumber
      if (grade) query.grade = grade
      if (officeAddress) query.officeAddress = officeAddress
      let userData: any = {}
      if (!userCheckAlready) {


        userData = await this.userRepository.create(query)

      } else {
        userData = userCheckAlready
      }
      let filess
      if (files && files.idCardImages) {
        filess = files && files.idCardImages && files.idCardImages.length ? files.idCardImages : [files.idCardImages]
      }
      if (filess) {
        let files = filess.map((file: any) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), userData._id))
        let eidImageUrls = await Promise.all(files);
        await this.userRepository.update({ _id: userData._id }, { eidImageUrls })
      }

      user = userData._id

      if (userCheckAlready) {
        await this.userRepository.update({ _id: userCheckAlready._id }, {});
        user = userCheckAlready._id
      }

      let appointmentQuery: any = {
        user
      }

      // if (paymentType && appointment && appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.UN_PAID) {
      //     appointmentQuery.paymentTypes = [{
      //         paymentType: paymentType,
      //         amount: appointment.price
      //     }]
      // }

      // appointmentQuery.paymentTypes = [{
      //     paymentType: PAYMENT_TYPE.CARD,
      //     amount: appointment.price,
      //     commissionType: appointment.initialCommissionType,
      //     commissionValue: appointment.initialCommissionValue || 0,
      //     extraAmountIfNotCard: appointment.initialExtraAmountIfNotCard

      // }]

      if (covidTestCause) appointmentQuery.covidTestCause = covidTestCause
      if (flightDate) appointmentQuery.flightDate = flightDate
      if (airlineName) appointmentQuery.airlineName = airlineName
      if (destination) appointmentQuery.destination = destination
      if (symptoms) appointmentQuery.symptoms = symptoms
      if (travelHistory) appointmentQuery.travelHistory = travelHistory
      if (vtmNumber) appointmentQuery.vtmNumber = vtmNumber
      if (history) appointmentQuery.history = JSON.parse(history)

      let availableAppointment = await this.appointmentRepository.findOne({ status: { $in: [STATUS.ARRIVED, STATUS.BOOKED, STATUS.EN_ROUTE] }, booking: checkBooking._id, user: { $exists: false } })
      await this.appointmentRepository.update({ _id: availableAppointment._id }, appointmentQuery);

    }
    if (!appointment && isNewAppointment) {
      // console.log("6")


      // throw new Error("All appointment are booked")
      let appointment: any = await this.appointmentRepository.findOne({ booking: checkBooking._id, status: { $nin: [STATUS.CANCELLED, STATUS.SAMPLE_COLLECTED, STATUS.COMPLETED] } })
      if (!appointment)
        throw new Error("All appointments are cancelled or marked sample collected for this booking")
      delete appointment._id
      delete appointment.user
      delete appointment.__v
      delete appointment.appointmentId
      delete appointment.subService
      delete appointment.destination
      delete appointment.flightDate
      delete appointment.covidTestCause
      // delete appointment.paymentType
      delete appointment.mrNumber
      delete appointment.isNewForBooking
      delete appointment.paymentTypes
      delete appointment.vtmNumber

      // let subServiceData = await SubService.findOne({ _id: appointment.subService }).lean()
      // let subServiceData = checkBooking.initialSubServices.find(element => String(element.subService) === String(appointment.subService));

      // let newPrice = ((subServiceData.initialPrice / 100) * appointment.vat) + Number(subServiceData.initialPrice)
      let vat = await this.masterRepository.findOne({});

      // let subSData = await SubService.findOne({ _id: subServiceData.subService }).lean()
      let mrNumberPrevious = Number(vat.mrNumberCount)
      let mrDate = `${new Date().getFullYear() + numeral(new Date().getMonth() + 1).format('00') + numeral(new Date().getDate()).format("00")}`

      // let payy = {
      //     paymentType: paymentType,
      //     amount: newPrice,
      //     commissionType: appointment.initialCommissionType,
      //     commissionValue: appointment.initialCommissionValue || 0,
      //     // extraAmountIfNotCard: (paymentType === INITIAL_PAYMENT_TYPE.CARD || paymentType === INITIAL_PAYMENT_TYPE.PAID) ? 0 : subSData.extraAmountIfNotCard
      //     extraAmountIfNotCard: 0
      // }

      await this.appointmentRepository.create({
        ...appointment,
        // initialExtraAmountIfNotCard: (paymentType === INITIAL_PAYMENT_TYPE.CARD || paymentType === INITIAL_PAYMENT_TYPE.PAID) ? 0 : subSData.extraAmountIfNotCard,
        initialExtraAmountIfNotCard: 0,
        isNewForBooking: true,
        labId: `QAM${mrDate + numeral(mrNumberPrevious + 1).format("000")}`,
        paymentTypes: [
          //     {
          //     ...payy
          // }
        ]
      })

      await this.masterRepository.update({}, { $inc: { mrNumberCount: 1 } })

      await this.bookingRepository.update({ bookingId }, {
        $inc: { noOfAppointments: 1, },
      })

      let orQuery = []

      if (eid) {
        orQuery.push({
          eid, type: TYPE.USER
        })
      }

      if (!eid && passportNumber) {
        orQuery.push({
          passportNumber, type: TYPE.USER
        })
      }

      let userCheckAlready = await this.userRepository.findOne({ $or: orQuery })

      let query: any = {
        password: md5("qam_password"),
        dob,
        phone,
        gender,
        type: TYPE.USER,
        residentOrVisitor,

      }
      if (firstName) query.firstName = firstName
      if (nationality) query.nationality = nationality
      if (email) query.email = email.toLowerCase()
      if (passportNumber) query.passportNumber = passportNumber
      if (eid) query.eid = eid
      if (address) query.address = address
      if (jobDescription) query.jobDescription = jobDescription
      if (companyName) query.companyName = companyName
      if (occupation) query.occupation = occupation
      if (area) query.area = area
      if (checkBooking.addressTwo) query.addressTwo = checkBooking.addressTwo
      if (institute) query.institute = institute
      if (campName) query.campName = campName
      if (supervisorName) query.supervisorName = supervisorName
      if (supervisorNumber) query.supervisorNumber = supervisorNumber
      if (grade) query.grade = grade
      if (officeAddress) query.officeAddress = officeAddress

      if (!userCheckAlready) {

        let userData = await this.userRepository.create(query)

        let filess
        if (files && files.idCardImages) {
          filess = files && files.idCardImages && files.idCardImages.length ? files.idCardImages : [files.idCardImages]
        }
        if (filess) {
          let files = filess.map((file: any) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), userData._id))
          let eidImageUrls = await Promise.all(files);
          await this.userRepository.update({ _id: userData._id }, { eidImageUrls })
        }

        user = userData._id
      }

      if (userCheckAlready) {
        await this.userRepository.update({ _id: userCheckAlready._id }, query)
        user = userCheckAlready._id
      }

      let appointmentQuery: any = {
        user
      }

      if (paymentType && appointment && appointment.initialPaymentType === INITIAL_PAYMENT_TYPE.UN_PAID) {
        appointmentQuery.paymentTypes = [{
          paymentType: paymentType,
          amount: appointment.price,
          commissionType: appointment.initialCommissionType,
          commissionValue: appointment.initialCommissionValue || 0,
          // extraAmountIfNotCard: (paymentType === INITIAL_PAYMENT_TYPE.CARD || paymentType === INITIAL_PAYMENT_TYPE.PAID) ? 0 : subSData.extraAmountIfNotCard
          extraAmountIfNotCard: 0
        }]
        // console.log("innerBody")
      }

      if (covidTestCause) appointmentQuery.covidTestCause = covidTestCause
      if (flightDate) appointmentQuery.flightDate = flightDate
      if (airlineName) appointmentQuery.airlineName = airlineName
      if (destination) appointmentQuery.destination = destination
      if (symptoms) appointmentQuery.symptoms = symptoms
      if (travelHistory) appointmentQuery.travelHistory = travelHistory
      if (history) appointmentQuery.history = JSON.parse(history)
      if (paymentType) appointmentQuery.initialPaymentType = paymentType
      if (paymentType) appointmentQuery.vtmNumber = vtmNumber

      let availableAppointment = await this.appointmentRepository.findOne({ status: { $in: [STATUS.ARRIVED, STATUS.BOOKED, STATUS.EN_ROUTE] }, booking: checkBooking._id, user: { $exists: false } })
      await this.appointmentRepository.update({ _id: availableAppointment._id }, appointmentQuery)

    }

    let bookingDoc = await this.bookingRepository.returnDataForConsentForm(checkBooking._id);
    console.log({ bookingDoc });

    response.setSuccessAndData({ isNew: false }, StaticStringKeys.APPOINTMENT_ASSIGN_SUCCESSFUL)
    return response;
  }


  async assignTeamMember(assignTeamMemberDTO: { _id: string, members: string, vehicle: string }): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let { _id, members, vehicle } = assignTeamMemberDTO

    let query = {} as { _id: string, members: string, vehicle: string }

    const isbooking = await this.bookingRepository.findById(query._id);
    if (!isbooking) {
      throw new Error(StaticStringKeys.NOT_FOUND("booking"))
    }

    if (members) query.members = members
    if (vehicle) query.vehicle = vehicle

    await this.bookingRepository.update({ _id }, query)


    await this.appointmentRepository.update({ booking: _id }, { members })
    response.setSuccess(StaticStringKeys.ASSIGN_MEMBER)
    return response
  }


  async update(bookingDTO: BookingDTO): Promise<ResponseModel<BookingDTO>> {
    const response = new ResponseModel<BookingDTO>()
    let { _id, address, addressTwo, phone, zone, region, coordinate, time, slot, initialPaymentType, price } = bookingDTO

    let slotData: any
    let booking = await this.bookingRepository.findOne({ _id });

    let allAppoint = await this.appointmentRepository.find({ booking: booking._id, status: { $in: [STATUS.SAMPLE_COLLECTED] } })
    if (allAppoint.length == booking.noOfAppointments) {
      throw new ConflictRequestError(StaticStringKeys.BOOKING_IS_FAILED_TO_UPDATED)
    }

    if (initialPaymentType) {
      // console.log(booking)

      if (initialPaymentType !== booking.initialPaymentType) {
        let userCheck = await this.appointmentRepository.find({ booking: _id, user: { $exists: true } })
        if (userCheck && userCheck.length) {
          throw new ConflictRequestError(StaticStringKeys.CANNOT_CHANGE_PAYMENT)
        }
      }

    }

    if (price) {

      let userCheck = await this.appointmentRepository.find({ booking: _id, user: { $exists: true } })
      if (userCheck && userCheck.length) {
        throw new ConflictRequestError(StaticStringKeys.CANNOT_CHANGE_PRICE)
      }
    }

    if (slot) {
      slotData = await this.slotRepository.findOne({ _id: slot })
    }

    let appointmentQuery = {} as BookingDTO

    if (address)
      appointmentQuery.address = address
    if (addressTwo)
      appointmentQuery.addressTwo = addressTwo
    if (time)
      appointmentQuery.time = time
    if (phone)
      appointmentQuery.phone = phone
    if (zone)
      appointmentQuery.zone = zone
    if (region)
      appointmentQuery.region = region
    if (coordinate) {
      appointmentQuery.lat = coordinate.lat
      appointmentQuery.lng = coordinate.lng
    }

    let bookingQuery = {} as BookingDTO
    if (address)
      bookingQuery.address = address
    if (addressTwo)
      bookingQuery.addressTwo = addressTwo
    if (phone)
      bookingQuery.phone = phone
    if (time) {
      bookingQuery.time = time
      let slotTime = new Date(slotData.startTime).setHours(slotData.startTime.getHours() + 5)
      bookingQuery.appointmentTime = new Date(new Date(time).toISOString().split('T')[0] + 'T' + new Date(slotTime).toISOString().split('T')[1])
      // appointmentQuery.appointmentTime = new Date(new Date(time).toISOString().split('T')[0] + 'T' + new Date(slotTime).toISOString().split('T')[1])

    }
    if (zone)
      bookingQuery.zone = zone
    if (region)
      bookingQuery.region = region
    if (coordinate) {
      bookingQuery.lat = coordinate.lat
      bookingQuery.lng = coordinate.lng
    }
    if (initialPaymentType) {
      bookingQuery.initialPaymentType = initialPaymentType
      appointmentQuery.initialPaymentType = initialPaymentType
    }
    if (price) {
      appointmentQuery.price = ((price / 100) * booking.vat) + Number(price)
    }

    if (slotData) {
      appointmentQuery.startTime = slotData.startTime
      appointmentQuery.endTime = slotData.endTime
      bookingQuery.startTime = slotData.startTime
      bookingQuery.endTime = slotData.endTime
      bookingQuery.slot = slotData._id
      appointmentQuery.slot = slotData._id
    }

    await this.bookingRepository.update({ _id }, bookingQuery)
    await this.appointmentRepository.update({ booking: _id }, appointmentQuery, { multiple: true })
    response.setSuccess(StaticStringKeys.SUCCESSFULL_UPDATE)
    return response
  }


  commissionCalculate(vendor: VendorDTO) {
    let commissions = vendor.subServicesOffered[0].commission
    let cashee = 0
    let commission = 0
    let extraAmountIfNotCard = vendor.extraAmountIfNotCard ? vendor.extraAmountIfNotCard : 0
    let percentage = commissions.value

    if (commissions.type === COMMISSION_TYPE.PERCENTAGE) {
      commission = ((Number(extraAmountIfNotCard) / 100) * Number(percentage))
      cashee = vendor.extraAmountIfNotCard ? vendor.extraAmountIfNotCard : 0
      return {
        commission,
        cashee
      }
    }
    return {
      commission,
      cashee
    }

  }

  async changeStatus(query: { _id: string, status: string, remarks: string }, adminDTO: AdminDTO, vehicleDTO: VehicleDTO): Promise<ResponseModel<any>> {
    const response = new ResponseModel()
    const session = await mongoose.startSession();
    try {
      let { _id, status, remarks } = query

      session.startTransaction();


      let allAppoint = await this.appointmentRepository.find({ booking: _id, status: { $nin: [STATUS.CANCELLED] } });
      if (allAppoint.length == 0) {
        throw new Error(`Booking ${status} is failed beacuse Appointment is not available`)
      }
      switch (status) {

        case STATUS.BOOKED:
          await this.bookingRepository.update({ _id }, { status }, { session })
          await this.appointmentRepository.updateMany({ booking: _id, status: { $nin: [STATUS.CANCELLED] } }, { status }, { session });
          break;

        case STATUS.EN_ROUTE:
          let checkAppointment = await this.bookingRepository.findOne({ _id, vehicle: { $exists: true }, members: { $exists: true, $ne: [] } });
          if (!checkAppointment)
            throw new Error("No team is assigned to this booking")
          await this.bookingRepository.update({ _id }, { status }, { session });
          await this.appointmentRepository.updateMany({ booking: _id, status: { $nin: [STATUS.CANCELLED] } }, { status }, { session });
          break;

        case STATUS.ARRIVED:


          await this.bookingRepository.update({ _id }, { status }, { session });
          await this.appointmentRepository.updateMany({ booking: _id, status: { $nin: [STATUS.CANCELLED] } }, { status }, { session })
          break;

        case STATUS.SAMPLE_COLLECTED:
          let booking = await this.bookingRepository.findOne({ _id });
          // if (booking.customerType === CUSTOMER_TYPE.WALK_IN) {
          //     await this.bookingRepository.update({ _id }, { status }, { session })
          //     await this.appointmentRepository.update({ booking: _id, }, { status }, { session })
          //     break
          // }
          let appointments = await this.appointmentRepository.find({ booking: _id, user: { $exists: true }, status: STATUS.SAMPLE_COLLECTED });

          if (appointments.length !== Number(booking.noOfAppointments))
            throw new Error("Sample is not collected from all appointments")

          await this.bookingRepository.update({ _id }, { status }, { session });
          await this.appointmentRepository.updateMany({ booking: _id, status: { $nin: [STATUS.CANCELLED] }, user: { $exists: true } }, { status }, { session })
          break;

        case STATUS.COMPLETED:
          let bookingDoc = await this.bookingRepository.findOne({ _id });

          // if (bookingDoc.customerType === CUSTOMER_TYPE.HOME_SAMPLE && !bookingDoc.vehicle) {
          //     throw new Error("Must assign vehicle before completion")
          // }

          let allAppointments = await this.appointmentRepository.find({ booking: _id, user: { $exists: true }, status: { $nin: [STATUS.CANCELLED] } });
          if (allAppointments.length == 0) {
            throw new Error("Booking completed is failed beacuse Appointment is not available")
          }
          let totalCardAmount = 0;
          let totalCashAmount = 0;
          let totalCreditCardAmount = 0
          let totalOnlineAmount = 0
          let paidCommission = 0
          let pendingcommission = 0
          let appointmentVat = 0
          let totalAppointmentVat = 0
          allAppointments.forEach(async (appointment) => {
            if (appointment.vat) {
              appointmentVat = appointment.vat
            }
            // cash 
            // vendor
            // bank
            for (let idx = 0; idx < appointment.paymentTypes.length; idx++) {
              if (appointment.paymentTypes[idx].paymentType == PAYMENT_TYPE.CASH) {
                totalCashAmount += appointment.paymentTypes[idx].amount

                pendingcommission += appointment.paymentTypes[idx].commissionValue + appointment.paymentTypes[idx].extraAmountIfNotCard

              } else if (appointment.paymentTypes[idx].paymentType == PAYMENT_TYPE.CARD) {
                totalCardAmount += appointment.paymentTypes[idx].amount

                paidCommission += appointment.paymentTypes[idx].commissionValue

              } else if (appointment.paymentTypes[idx].paymentType == PAYMENT_TYPE.ONLINE_TRANSFER) {
                totalOnlineAmount += appointment.paymentTypes[idx].amount

                pendingcommission += appointment.paymentTypes[idx].commissionValue + appointment.paymentTypes[idx].extraAmountIfNotCard

              } else if (appointment.paymentTypes[idx].paymentType == PAYMENT_TYPE.CREDIT_CARD) {
                totalCreditCardAmount += appointment.paymentTypes[idx].amount

                pendingcommission += appointment.paymentTypes[idx].commissionValue + appointment.paymentTypes[idx].extraAmountIfNotCard

              }
            }

          })
          if (totalCashAmount) {
            totalAppointmentVat = ((totalCashAmount / 100) * appointmentVat || 0)
            totalCashAmount = totalCashAmount + totalAppointmentVat
          }
          if (totalCardAmount) {
            totalAppointmentVat = ((totalCardAmount / 100) * appointmentVat || 0)
            totalCardAmount = totalCardAmount + ((totalCardAmount / 100) * appointmentVat || 0)
          }
          if (totalOnlineAmount) {
            totalAppointmentVat = ((totalOnlineAmount / 100) * appointmentVat || 0)
            totalOnlineAmount = totalOnlineAmount + totalAppointmentVat
          }
          if (totalCreditCardAmount) {
            totalAppointmentVat = ((totalCreditCardAmount / 100) * appointmentVat || 0)
            totalCreditCardAmount = totalCreditCardAmount + totalAppointmentVat
          }


          // console.log("paidCommission", paidCommission)
          // console.log("pendingcommission", pendingcommission)
          // console.log("totalCardAmount", totalCardAmount)
          // console.log("totalCashAmount", totalCashAmount)
          // console.log("totalCreditCardAmount", totalCreditCardAmount)
          let vendor = await this.vendorRepository.findOne({ _id: bookingDoc.vendor });

          if (totalCashAmount) {
            let extraAmount = await this.commissionCalculate(vendor)
            pendingcommission += extraAmount.commission
            totalCashAmount += extraAmount.cashee
          }
          else if (totalOnlineAmount) {
            let extraAmount = await this.commissionCalculate(vendor)
            pendingcommission += extraAmount.commission
            totalOnlineAmount += extraAmount.cashee
          }
          else if (totalCreditCardAmount) {
            let extraAmount = await this.commissionCalculate(vendor)

            pendingcommission += extraAmount.commission
            totalCreditCardAmount += extraAmount.cashee
          }

          // console.log("pendingcommission", pendingcommission)
          // console.log("totalCashAmount", totalCashAmount)
          // console.log("totalCreditCardAmount", totalCreditCardAmount)
          // console.log("totalCardAmount", totalCardAmount)

          let financesDoc: FinanceDTO[] = []
          // throw new Error("rrooooook")
          if (totalCardAmount) {

            let obj = {
              status: STATUS.COMPLETED,
              amount: totalCardAmount,
              paymentType: PAYMENT_TYPE.CARD,
              booking: bookingDoc._id,
              type: financeEnum.TYPE.USER_PAYMENT,
              vendor: bookingDoc.vendor,
              time: new Date(),
              customerType: bookingDoc.customerType,
              bdo: bookingDoc.bdo
            } as unknown as FinanceDTO

            if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
              obj.vehicle = bookingDoc.vehicle
            }
            if (bookingDoc.customerType == CUSTOMER_TYPE.WALK_IN) {
              obj.admin = bookingDoc.admin
            }
            financesDoc.push(obj)
          }

          if (totalCashAmount) {

            let obj = {
              status: STATUS.COMPLETED,
              amount: totalCashAmount,
              paymentType: PAYMENT_TYPE.CASH,
              booking: bookingDoc._id,
              type: financeEnum.TYPE.USER_PAYMENT,
              vendor: bookingDoc.vendor,
              time: new Date(),
              customerType: bookingDoc.customerType,
              bdo: bookingDoc.bdo
            } as unknown as FinanceDTO
            if (bookingDoc.customerType == CUSTOMER_TYPE.WALK_IN) {
              obj.admin = bookingDoc.admin
            }
            if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
              obj.vehicle = bookingDoc.vehicle
            }
            financesDoc.push(obj)
          }

          if (totalCreditCardAmount) {

            let obj = {
              status: STATUS.COMPLETED,
              amount: totalCreditCardAmount,
              paymentType: PAYMENT_TYPE.CREDIT_CARD,
              booking: bookingDoc._id,
              type: financeEnum.TYPE.USER_PAYMENT,
              vendor: bookingDoc.vendor,
              time: new Date(),
              customerType: bookingDoc.customerType,
              bdo: bookingDoc.bdo
            } as unknown as FinanceDTO
            if (bookingDoc.customerType == CUSTOMER_TYPE.WALK_IN) {
              obj.admin = bookingDoc.admin
            }
            if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
              obj.vehicle = bookingDoc.vehicle
            }
            financesDoc.push(obj)
          }

          if (totalOnlineAmount) {

            let obj = {
              status: financeEnum.STATUS.COMPLETED,
              amount: totalOnlineAmount,
              paymentType: PAYMENT_TYPE.ONLINE_TRANSFER,
              booking: bookingDoc._id,
              type: financeEnum.TYPE.USER_PAYMENT,
              vendor: bookingDoc.vendor,
              time: new Date(),
              customerType: bookingDoc.customerType!,
              bdo: bookingDoc.bdo as any
            } as unknown as FinanceDTO
            if (bookingDoc.customerType == CUSTOMER_TYPE.WALK_IN) {
              obj.admin = bookingDoc.admin
            }
            if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
              obj.vehicle = bookingDoc.vehicle
            }

            financesDoc.push(obj)
          }

          if (paidCommission) {

            let obj = {
              status: STATUS.COMPLETED,
              amount: paidCommission,
              paymentType: financeEnum.TYPE.PAID_COMMISSION,
              booking: bookingDoc._id,
              type: financeEnum.TYPE.PAID_COMMISSION,
              vendor: bookingDoc.vendor,
              time: new Date(),
              admin: bookingDoc.admin
            } as unknown as FinanceDTO

            financesDoc.push(obj)
          }
          await this.financeRepository.insertMany(financesDoc, { session })
          // console.log("totalCreditCardAmount", totalCreditCardAmount)
          // console.log("totalOnlineAmount", totalOnlineAmount)


          await this.masterRepository.update({}, {
            $inc: {
              vat: totalAppointmentVat,
              totalRiderDue: totalCashAmount,
              totalVendorReceived: (totalCashAmount + totalCreditCardAmount + totalOnlineAmount) - pendingcommission,
              totalVendorEarned: (totalCardAmount + totalCashAmount + totalCreditCardAmount + totalOnlineAmount) - paidCommission,
              totalBankEarned: totalCreditCardAmount + totalOnlineAmount,
              totalCommissionEarned: paidCommission + pendingcommission,
              totalCommissionPaid: paidCommission
            }
          }, { session });

          if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
            await this.vendorRepository.update({ _id: bookingDoc.vehicle }, { $inc: { totalAvailableAmount: totalCashAmount, totalReceivedAmount: totalCashAmount } }, { session });
          }

          if (bookingDoc.customerType == CUSTOMER_TYPE.WALK_IN) {
            // await Vendor.update({ _id: bookingDoc.vendor }, { $inc: { totalEarned: totalCashAmount } }, { session })
            await this.adminRepository.update({ _id: bookingDoc.admin }, { $inc: { totalCashInHand: totalCashAmount, totalCollected: totalCashAmount } }, { session });
          }
          // totalCommissionEarned
          // totalCommissionPaid

          await this.vendorRepository.update({ _id: bookingDoc.vendor }, {
            $inc: {
              totalEarned: ((totalCardAmount - paidCommission) + totalCashAmount + totalCreditCardAmount + totalOnlineAmount) - pendingcommission,
              totalReceived: (totalCashAmount + totalCreditCardAmount + totalOnlineAmount) - pendingcommission,
              totalCommissionEarned: paidCommission + pendingcommission,
              totalCommissionPaid: paidCommission,
            }
          }, { session });

          await this.appointmentRepository.updateMany({ booking: _id, user: { $exists: true }, status: { $nin: [STATUS.CANCELLED] } }, { status: STATUS.COMPLETED }, { session });
          let bookingPayload: { extraAmountIfNotCard: number, status: string } = {
            status,
            extraAmountIfNotCard: 0
          }
          if (totalCashAmount || totalCreditCardAmount || totalOnlineAmount)
            bookingPayload.extraAmountIfNotCard = vendor.extraAmountIfNotCard

          if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
            let body = {
              status: STATUS.COMPLETED,
              amount: totalCashAmount + totalCreditCardAmount + totalOnlineAmount + totalCardAmount,
              paymentType: PAYMENT_TYPE.CASH,
              booking: bookingDoc._id,
              // type: financeEnum.TYPE.USER_PAYMENT,
              vendor: bookingDoc.vendor,
              time: new Date(),
              type: financeEnum.TYPE.HOME_SAMPLE_REVENUE,
              bdo: bookingDoc.bdo,
              noOfAppointments: bookingDoc.noOfAppointments,
              vehicle: bookingDoc.vehicle
            } as unknown as FinanceDTO

            await this.financeRepository.create(body, { session })
          }
          let remarksPayload = {} as { remarks: string, admin: string, vehicle: string }

          if (remarks)
            remarksPayload.remarks = remarks
          if (remarks && adminDTO)
            remarksPayload.admin = adminDTO._id
          if (remarks && vehicleDTO)
            remarksPayload.vehicle = vehicleDTO._id

          await this.bookingRepository.update({ _id }, bookingPayload, { session });

          await this.bookingRepository.update({ _id }, { $push: { remarks: remarksPayload } }, { session });

          break;
      }
      await session.commitTransaction();

      response.setSuccess(status === STATUS.COMPLETED ? "Booking completed" : "Booking's status is updated")
    } catch (error) {
      await session.abortTransaction();
    }
    return response
  }


  async cancelBooking(cancelDTO: { _id: string, remarks: string }, adminDTO: AdminDTO, vehicleDTO: VehicleDTO): Promise<ResponseModel<BookingDTO>> {
    const response = new ResponseModel<BookingDTO>();
    let bookingDoc = await this.bookingRepository.findOne({ _id: cancelDTO._id }, 'vehicle');
    if (bookingDoc.vehicle) {
      // io.emit(bookingDoc.vehicle + ',cancelled', {
      //     _id: cancelDTO._id,
      //     remarks:cancelDTO.remarks
      // })
    }

    if (!adminDTO) {
      let data = vehicleDTO._id;
      await this.bookingRepository.update({ _id: cancelDTO._id }, { status: STATUS.CANCELLED, cancelBy: data });
      await this.adminRepository.updateMany({ booking: cancelDTO._id }, { status: STATUS.CANCELLED, cancelBy: data });

    }
    else if (!vehicleDTO) {
      let data = adminDTO._id;
      await this.bookingRepository.update({ _id: cancelDTO._id }, { status: STATUS.CANCELLED, cancelBy: data });
      await this.adminRepository.updateMany({ booking: cancelDTO._id }, { status: STATUS.CANCELLED, cancelBy: data });
    }
    response.setSuccess(StaticStringKeys.BOOKING_CANCELLED)
    return response
  }

  async getBookingsForVehicle(bookingDTO: { status: STATUS[] }, vehicleDTO: VehicleDTO): Promise<ResponseModel<any>> {
    const response = new ResponseModel<any>();
    if (!bookingDTO.status) {
      bookingDTO.status = [
        STATUS.BOOKED,
        STATUS.EN_ROUTE,
        STATUS.ARRIVED,
        STATUS.SAMPLE_COLLECTED,
      ]
    }
    const { _id } = vehicleDTO
    let start;
    let end;
    let currentTime
    if (!status.includes(STATUS.COMPLETED)) {

      currentTime = new Date();

      start = new Date();
      start.setDate(start.getDate() - 1);
      // start.setHours(0, 0, 0, 0);
      start.setHours(start.getHours() + 5)

      end = new Date();
      end.setDate(end.getDate() + 1);
      // end.setHours(0, 0, 0, 0);

      end.setHours(end.getHours() + 5)

      currentTime = currentTime.setFullYear(1970, 0, 1)

    }
    currentTime = new Date();

    start = new Date();
    start.setDate(start.getDate() - 1);
    // start.setHours(0, 0, 0, 0);
    start.setHours(start.getHours() + 5)

    end = new Date();
    end.setDate(end.getDate() + 1);
    // end.setHours(0, 0, 0, 0);

    end.setHours(end.getHours() + 5)

    let data = await this.bookingRepository.getBookingsForVehicle({ start: start, end: end, _id: _id });
    response.setSuccessAndData(data)
    return response
  }



  async getAllUnassignedForGodsEye(unAssignedDTO: { searchQueryText: string }): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>
    let query: any = {
      vehicle: { $exists: false },
    }

    let { searchQueryText } = unAssignedDTO

    if (searchQueryText) {
      query['$text'] = { '$search': searchQueryText }
    }

    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    let data = await this.bookingRepository.getAllUnassignedForGodsEye({ start: start, end: end });
    response.setSuccessAndData(data);
    return response;
  }


  async getBookingById(_id: string): Promise<ResponseModel<any>> {
    const response = new ResponseModel<any>();
    const bookingDoc = await this.bookingRepository.getBookingById(_id);
    if (bookingDoc && bookingDoc.length == 0) {
      throw new NotFoundError(StaticStringKeys.INVALID_ID("booking"))
    }
    response.setSuccessAndData(bookingDoc[0]);
    return response

  }



  async bookingCreateWalkin(bookignDTO: CreateBookingWalkInDTO, adminDTO: AdminDTO, filesObj: any): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let {
      initialPaymentType,
      firstName,
      dob,
      phone,
      gender,
      email,
      eid,
      passportNumber,
      residentOrVisitor,
      jobDescription,
      addressTwo,
      companyName,
      nationality,
      occupation,
      area,
      institute,
      campName,
      supervisorName,
      supervisorNumber,
      grade,
      officeAddress,
      history,
      slot,
      time,
      paymentType,
      user,
      vendor,
      subService,
      discount = 0
    } = bookignDTO

    let splitDate = new Date().toISOString().split('T');
    time = `${splitDate[0]}T00:00:00.000Z`

    let subServices = subService;
    if (!_.isObject(subService)) {
      subServices = JSON.parse(subService as any)
    }

    let { _id } = adminDTO

    let adminCheck = await this.adminRepository.findOne({ _id });

    if (discount) {
      if (Number(discount) > Number(adminCheck.maxDiscount)) {
        throw new ForbiddenError("Admin has limited rights")
      }
    }

    let orQuery = []

    if (eid) {
      orQuery.push({
        eid, type: TYPE.USER
      })
    }

    if (!eid && passportNumber) {
      orQuery.push({
        passportNumber, type: TYPE.USER
      })
    }

    let userCheckAlready = await this.userRepository.findOne({ $or: orQuery });

    if (!userCheckAlready) {

      let userBody = {
        password: md5("qam_password"),
        type: TYPE.USER,
        residentOrVisitor,
      } as unknown as UserDTO
      if (firstName)
        userBody.firstName = firstName
      if (dob)
        userBody.dob = dob
      if (phone)
        userBody.phone = phone
      if (gender)
        userBody.gender = gender
      if (email)
        userBody.email = email
      if (eid)
        userBody.eid = eid
      if (residentOrVisitor)
        userBody.residentOrVisitor = residentOrVisitor
      if (jobDescription)
        userBody.jobDescription = jobDescription
      if (addressTwo)
        userBody.addressTwo = addressTwo
      if (companyName)
        userBody.companyName = companyName
      if (nationality)
        userBody.nationality = nationality
      if (occupation)
        userBody.occupation = occupation
      if (area)
        userBody.area = area
      if (institute)
        userBody.institute = institute
      if (campName)
        userBody.campName = campName
      if (supervisorName)
        userBody.supervisorName = supervisorName
      if (supervisorNumber)
        userBody.supervisorNumber = supervisorNumber
      if (grade)
        userBody.grade = grade
      if (officeAddress)
        userBody.officeAddress = officeAddress
      if (history)
        userBody.history = history
      if (passportNumber)
        userBody.passportNumber = passportNumber

      let userData = await this.userRepository.create(userBody)

      let filess
      if (filesObj && filesObj.idCardImages) {
        filess = filesObj && filesObj.idCardImages && filesObj.idCardImages.length ? filesObj.idCardImages : [filesObj.idCardImages]
      }
      if (filess) {
        let files = filess.map((file: { mimetype: string; data: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }) => multipartFileUpload(file, new Date().getTime() + Math.floor(100000 + Math.random() * 9000), userData._id))
        let eidImageUrls = await Promise.all(files);
        await this.userRepository.update({ _id: userData._id }, { eidImageUrls })
      }

      user = userData._id
    }

    if (userCheckAlready) {
      user = userCheckAlready._id
    }

    // let slotData = await Slots.findOne({ _id: slot })

    let slotData: Date | number = new Date()
    slotData = slotData.setFullYear(1970, 0, 1)

    let endTime = new Date(new Date(slotData).getTime() + 30 * 60000)

    // let subServiceData = await SubService.findOne({ _id: subServices[0] })
    let subServiceData: any = await this.vendorRepository.findOne({ _id: vendor });
    if (!subServiceData) {
      throw new Error("Vendor could not be found for the provided vendor ID")
    }
    let bdo = subServiceData.bdo

    subServiceData = subServiceData.subServicesOffered.filter((obj: { subService: any; }) => String(obj.subService) === String(subServices[0]))

    subServiceData = subServiceData[0]

    let branch = await this.branchRepository.findOne({})
    let vat = await this.masterRepository.findOne({})
    let vendorVat = await this.vendorRepository.findOne({ _id: vendor })
    const testIds = subServices.map(item => new mongoose.Types.ObjectId(item))

    const appointmentTest = await this.vendorRepository.getComissionByVidAndTids({ vendorId: vendor, paymentType, testIds: testIds })
    if (appointmentTest.length != subServices.length)
      throw new Error("Vendor could not be offered for the provided test(s) ID ")

    let bookingBody = {
      firstName,
      branch: branch._id,
      noOfAppointments: Number(subServices.length),
      status: STATUS.SAMPLE_COLLECTED,
      email,
      phone,
      addressTwo,
      paymentType,
      time: new Date(time),
      slot,
      // startTime: slotData.startTime,
      // endTime: slotData.endTime,
      startTime: slotData,
      endTime: endTime,
      customerType: CUSTOMER_TYPE.WALK_IN,
      vat: vendorVat.vat,
      password: "",
      subService: testIds,
      initialPaymentType: paymentType,
      vendor,

      admin: _id,
      bdo,
      discount,
    } as unknown as BookingDTO


    bookingBody["time"] = new Date()

    if (initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }

    if (initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }
    if (!paymentType) paymentType = PAYMENT_TYPE.CARD


    let bookingData = await this.bookingRepository.create(bookingBody)

    let paymentTypesArray = [{
      commissionValue: appointmentTest[0].totalCommission,
      paymentType: paymentType,
      amount: ((appointmentTest[0].totalAmount / 100) * vat.vat) + Number(appointmentTest[0].totalAmount)
    }]
    // let appointments = subServices.map((obj, i) => {
    //     return appointmentForWalkIn({ bookingData, subService:appointmentTest, _id, user, i, ...req.body,paymentTypes: paymentTypesArray })
    // })
    let appointments = [{
      //@ts-ignore
      ...bookingData, user, ...bookignDTO, paymentTypes: paymentTypesArray, subService: appointmentTest, booking: bookingData._id, bookingId: bookingData.bookingId, bdo, time: new Date(time), vat: vendorVat.vat,
    }]

    await this.appointmentRepository.insertMany(appointments)

    await this.financeService.bookingCompleteWalkIn({ _id: bookingData._id })
    response.setSuccessAndData({ bookingId: bookingData.bookingId }, "Booking Created Successfully")
    return response
  }

  async addRemarks(remarkDTO: { _id: string, remarks: string }, adminDTO: AdminDTO, vehicleDTO: VehicleDTO): Promise<ResponseModel<any>> {
    const response = new ResponseModel<any>();
    let { _id, remarks } = remarkDTO

    let checkBooking = await this.bookingRepository.findOne({ _id });

    if (!checkBooking) {

      let checkAppointment = await this.appointmentRepository.findOne({ _id });
      let checkBooking = await this.bookingRepository.findOne({ _id: checkAppointment.booking });

      if (!checkBooking || !checkAppointment)
        throw new Error("booking not found")

      let payload = {
        remarks
      } as unknown as { remark: string, admin: string, vehicle: string }
      if (adminDTO) {
        payload.admin = adminDTO._id
      } if (vehicleDTO) {
        payload.vehicle = vehicleDTO._id
      }
      await this.bookingRepository.update({ _id: checkAppointment.booking }, { $push: { remarks: payload } })
      await this.appointmentRepository.update({ _id }, { $push: { remarks: payload } })

    }
    else if (checkBooking) {

      let checkBooking = await this.bookingRepository.findOne({ _id });

      if (!checkBooking)
        throw new Error("booking not found")

      let payload = {
        remarks
      } as unknown as { remark: string, admin: string, vehicle: string }
      if (adminDTO)
        payload.admin = adminDTO._id
      if (vehicleDTO)
        payload.vehicle = vehicleDTO._id

      await this.bookingRepository.update({ _id }, { $push: { remarks: payload } })
    }
    response.setSuccess(StaticStringKeys.SUCCESSFULL_SAVE)
    return response
  }


  async downloadCsv(downloadCsvDTO: DownloadCSVBookingDTO):Promise<ResponseModel<DownloadCSVAppointmentAggregation[]>> {
    const response = new ResponseModel<DownloadCSVAppointmentAggregation[]>()
    let { status, hasana, startTime, endTime, vendor, slot, zone, bookingId, vehicle, subServices } = downloadCsvDTO;

    let bookingQuery = {} as DownloadCSVBookingQuery
    let appointmentQuery = {} as DownloadCSVAppointmentQuery

    if (subServices && subServices.length) {
      let newArray = subServices.map((_id) => {
        return new mongoose.Types.ObjectId(_id)
      })
      appointmentQuery.subService = { $in: newArray }
    }
    if (status && status.length) {
      appointmentQuery.status = { $in: status }
    }

    if (hasana && hasana === HASANA_ID_STATUS.ENTERED)
      appointmentQuery.hosanId = { $exists: true }

    if (hasana && hasana === HASANA_ID_STATUS.NOT_ENTERED)
      appointmentQuery.hosanId = { $exists: false }

    if (vehicle && vehicle === TEAM_ASSIGN.ASSIGNED)
      appointmentQuery.vehicle = { $exists: true }

    if (vehicle && vehicle === TEAM_ASSIGN.NOT_ASSIGNED)
      appointmentQuery.vehicle = { $exists: false }

    if (startTime && endTime) {
      let start = new Date(startTime)
      start.setHours(5, 0, 0, 0);
      let end = new Date(endTime);
      end.setHours(5, 0, 0, 0);
      bookingQuery.time = { $gte: start, $lte: end }
    }

    if (vendor) {
      bookingQuery.vendor = new mongoose.Types.ObjectId(vendor)
    }

    if (slot && Object.keys(slot).length) {
      let startTime = slot.startTime
      let endTime = slot.endTime
      bookingQuery.startTime = new Date(startTime)
      bookingQuery.endTime = new Date(endTime)
    }

    if (zone) {
      bookingQuery.zone = new mongoose.Types.ObjectId(zone)
    }

    if (bookingId) {
      bookingQuery.bookingId = bookingId
    }

    // try {
      let data = await this.bookingRepository.downloadCSV(bookingQuery, appointmentQuery)
      if (!data.length) {
        throw new NotFoundError(StaticStringKeys.NOT_FOUND("booking"))
      }

      response.setSuccessAndData(data)
      return response

   
  }

}

export default BookingService