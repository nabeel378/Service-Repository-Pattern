import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { APPOINTMENT_FOR, CUSTOMER_TYPE, INITIAL_PAYMENT_TYPE, TYPE, STATUS } from "../../enums/appointment.enum";
import IMasterRepository from "../../repositories/interfaces/imaster.repository";
import { DataCopier } from "../../utils/datacopier";
import BookingDTO from "../../models/dto-models/booking.dto";
import AppointmentDTO, { TestDTO } from "../../models/dto-models/appointment.dto";
import { COMMISSION_TYPE } from "../../enums/subservice.enum";
import IAppointmentRepository from "../../repositories/interfaces/iappointment.repository";
import CommissionCalculateDTO from "../../models/dto-models/vendor.commission-calculate.dto";
import { PAYMENT_TYPE } from "../../enums/finance.enum";
import IAppointmentService from "../interfaces/iappointment.service";
import { ForbiddenError, NotFoundError } from "../../errors/app.error";
import StaticStringKeys from "../../utils/constant";
import mongoose from "mongoose";
import IVendorRepository from "../../repositories/interfaces/ivendor.repository";
import IBookingRepository from "../../repositories/interfaces/ibooking.repository";
import { ResponseModel } from "../../utils/responsemodel";
import ILabRepository from "../../repositories/interfaces/ilab.repository";
import { multipartFileUpload } from "../../utils/imageupload";
import VehicleDTO from "../../models/dto-models/vehicle.dto";
import AdminDTO from "../../models/dto-models/admin.dto";
import moment from "moment";
const numeral = require('numeral');

@injectable()
class AppointmentService implements IAppointmentService {
  constructor(
    @inject(SERVICE_IDENTIFIER.MasterRepository) private masterRepository: IMasterRepository,
    @inject(SERVICE_IDENTIFIER.AppointmentRepository) private appointmentRepository: IAppointmentRepository,
    @inject(SERVICE_IDENTIFIER.VendorRepository) private vendorRepository: IVendorRepository,
    @inject(SERVICE_IDENTIFIER.BookingRepository) private bookingRepository: IBookingRepository,
    @inject(SERVICE_IDENTIFIER.LabRepository) private labRepository: ILabRepository,
  ) { }

  async create(bookingData: BookingDTO, paymentData: CommissionCalculateDTO): Promise<boolean> {

    let paymentType!: PAYMENT_TYPE

    if (bookingData.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }

    if (bookingData.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      paymentType = PAYMENT_TYPE.CARD
    }
    if (!paymentType) {
      paymentType = PAYMENT_TYPE.CARD
    }
    let commission = 0
    let zero = 0
    let extraAmountIfNotCard = 0;
    if (bookingData.initialPaymentType === INITIAL_PAYMENT_TYPE.CASH) { extraAmountIfNotCard = bookingData.extraAmountIfNotCard }
    else { extraAmountIfNotCard = zero };
    console.log({ bookingData })
    const appointment = new AppointmentDTO()
    const appointmentEntity: AppointmentDTO = DataCopier.copy(appointment, {

      booking: bookingData._id,
      bookingId: bookingData.bookingId,
      customerType: bookingData.customerType!,
      slot: bookingData.slot!,
      zone: bookingData.zone!,
      coordinate: bookingData.coordinate,
      address: bookingData.address,
      addressTwo: bookingData.addressTwo,
      // appUsers,
      time: new Date(bookingData.time),
      vendor: bookingData.vendor,
      vendorId: bookingData.vendorId,
      subService: [],
      price: paymentData.totalAmount || 0,
      branch: bookingData.branch,
      status: STATUS.BOOKED,
      appointmentFor: APPOINTMENT_FOR.SELF,
      vat: bookingData.vat,
      forCovidVaccination: false,
      // lat: 0,
      // lng: 0,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      // initialtest: testData._id,
      // initialPrice: price,
      initialPaymentType: bookingData.initialPaymentType,
      admin: bookingData.admin,
      initialCommissionType: paymentData.commissionType,
      initialCommissionValue: commission || 0,
      type: TYPE.LAB_TEST,
      region: bookingData.region!,
      bdo: bookingData.bdo,
    })

    if (bookingData.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
      appointmentEntity["appointmentTime"] = new Date(new Date(bookingData.time).toISOString().split('T')[0] + 'T' + new Date(bookingData.startTime).toISOString().split('T')[1])

    } else {
      appointmentEntity["time"] = new Date()
    }
    if (BookingDTO.covidTestCause) appointmentEntity.covidTestCause = BookingDTO.covidTestCause
    if (BookingDTO.airlineName) appointmentEntity.airlineName = BookingDTO.airlineName
    if (BookingDTO.symptoms) appointmentEntity.symptoms = BookingDTO.symptoms
    if (BookingDTO.destination) appointmentEntity.destination = BookingDTO.destination

    if (paymentData) {
      appointmentEntity.paymentTypes = [{
        paymentType: paymentData.paymentType,
        commissionType: paymentData.commissionType as COMMISSION_TYPE,
        commissionValue: paymentData.totalCommission,
        extraAmountIfNotCard: extraAmountIfNotCard,
        amount: ((paymentData.totalAmount / 100) * bookingData.vat) + Number(paymentData.totalAmount)
      }]
    }
    const masterData = await this.masterRepository.findOne({});
    let mrNumberPrevious = Number(masterData.mrNumberCount);

    let mrDate = `${new Date().getFullYear() + numeral(new Date().getMonth() + 1).format('00') + numeral(new Date().getDate()).format("00")}`

    let appointmentsArray: AppointmentDTO[] = []
    for (let i = 1; i <= Number(bookingData.noOfAppointments); i++) {

      appointmentsArray.push({
        ...appointmentEntity,
        subService: [paymentData] as unknown as TestDTO[],
        labId: `QAM${mrDate + numeral(mrNumberPrevious + 1).format("000")}`,
      })

      mrNumberPrevious = 1
    }
    await this.appointmentRepository.insertMany(appointmentsArray)
    return true
  }

  async subServiceUpdateForAppointmentMutipleTest(serviceDTO: { _id: string, subService: string[], vendor: string }): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let { _id, subService: test, vendor } = serviceDTO;

    let checkAppointment = await this.appointmentRepository.findOne({ _id });
    if (!checkAppointment) {
      throw new ForbiddenError(StaticStringKeys.INVALID_ID("appointment"))
    }

    if (checkAppointment.status === STATUS.COMPLETED || checkAppointment.status === STATUS.CANCELLED) {
      throw new ForbiddenError("You cant't change the test for this appointment");
    }
    let testData = await this.vendorRepository.findOne({ _id: new mongoose.Types.ObjectId(vendor) });
    if (!testData) {
      throw new ForbiddenError(StaticStringKeys.INVALID_ID("vendor"))
    }

    const bookingData = await this.bookingRepository.findOne({ _id: checkAppointment.booking });
    const paymentType = (bookingData.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) ? PAYMENT_TYPE.CREDIT_CARD : bookingData.initialPaymentType

    const testIds = test.map(item => new mongoose.Types.ObjectId(item))
    const appointmentTest = await this.vendorRepository.getComissionByVidAndTids({ vendorId: vendor, paymentType, testIds })
    if (appointmentTest.length !== testIds.length) {
      throw new ForbiddenError(StaticStringKeys.INVALID_ID("test"))
    }

    let totalPaidAmount = 0;
    if (checkAppointment.paymentTypes.length > 0 && checkAppointment.paymentTypes[0] && (checkAppointment.paymentTypes[0].paymentType == PAYMENT_TYPE.CARD || checkAppointment.paymentTypes[0].paymentType == PAYMENT_TYPE.CREDIT_CARD) && checkAppointment.initialPaymentType == INITIAL_PAYMENT_TYPE.PAID) {
      totalPaidAmount += checkAppointment.paymentTypes[0].amount
    };
    appointmentTest.forEach((item: { subServiceId: any }) => {
      item.subServiceId = new mongoose.Types.ObjectId(item.subServiceId)
    })
    const paymentTypeObj = {
      commissionValue: appointmentTest[0].totalCommission,
      paymentType: PAYMENT_TYPE.CASH,
      amount: (((appointmentTest[0].totalAmount / 100) * checkAppointment.vat) + Number(appointmentTest[0].totalAmount) - totalPaidAmount)
    }

    let paymentTypesArray = []
    if (checkAppointment.paymentTypes.length > 0) {
      paymentTypesArray.push(checkAppointment.paymentTypes[0])
    }
    paymentTypesArray.push(paymentTypeObj)
    if (totalPaidAmount == 0) {
      paymentTypesArray = [paymentTypeObj]
    }


    const updateBookingAndAppointment = [
      this.appointmentRepository.updateTest({
        appointmentId: _id,
        subService: appointmentTest,
        paymentTypes: paymentTypesArray
      })
      ,
      this.bookingRepository.addSetTest({
        bookingId: checkAppointment.booking as any,
        subServiceId: testIds,
        appointmentId: _id,
      })
    ]

    const [updateAppointmentEntity, updateBookingEntity] = await Promise.all(updateBookingAndAppointment)
    if (updateAppointmentEntity && updateBookingEntity) {
      response.setSuccess("Succesful Update")
    } else {
      let bookingDoc = await this.bookingRepository.subServiceUpdateForAppointmentMutiple(checkAppointment.booking!.toString())
      response.setSuccessAndData({ data: bookingDoc[0], greater: false });
    }

    return response
  }


  async getSingleAppointment(_id: string): Promise<ResponseModel<any[]>> {
    const response = new ResponseModel<any[]>()

    let data = await this.appointmentRepository.gitSingleAppointment(_id);
    response.setSuccessAndData(data)
    return response
  };

  async updateVTMandLabMultipleTest(body: { _id: string, subService: any[], lab: string }, filesObj: any[]) {
    const response = new ResponseModel<unknown>()
    let { _id, subService: test, lab } = body;
    let consentFormUrl: any[];

    test = Array.isArray(test) ? test : JSON.parse(test)
    let check = await this.appointmentRepository.findOne({ _id });
    if (!check) {
      throw new NotFoundError("Appointment is not found")
    }
    if (!check.vehicle) {
      throw new ForbiddenError("Assign Team first");
    }
    const testIds = test.map(item => new mongoose.Types.ObjectId(item.subService))
    const labIds = [new mongoose.Types.ObjectId(lab)]

    if (!lab) {
      throw new ForbiddenError("Lab Needed");
    }

    const { isValid, totalPrice } = await this.labRepository.isLabTestOffered({ labIds: labIds, testIds: testIds })

    if (!isValid) {

      throw new Error("This lab is not offering this test");
    }

    let appointment = await this.appointmentRepository.findOne({
      _id,
      user: { $exists: true },
    })

    if (!appointment) throw new ForbiddenError("User is not assign to Appointment");

    if (appointment.status === STATUS.SAMPLE_COLLECTED)
      throw new Error("VTM number is already updated");

    const fileObj: any = {}
    const fileValue: string[] = []
    // req.files = null
    if (filesObj) {
      const keys = Object.keys(filesObj)
      keys.forEach((item: any) => {
        const imageIdx = item.split("[")[1].split("]")[0]
        fileValue.push(imageIdx)
        fileObj[imageIdx] = filesObj[item]
      })
      console.log(fileObj)
    }

    if (fileValue) {
      let files = fileValue.map((file) =>
        multipartFileUpload(
          fileObj[file],
          new Date().getTime() + Math.floor(100000 + Math.random() * 9000),
          _id
        )
      );
      consentFormUrl = await Promise.all(files);
      fileValue.forEach((item: any, idx) => {
        test[item]["consentForm"] = consentFormUrl[idx]
      })
    }

    const testMaps: any = {};
    test.forEach(item => testMaps[item.subService] = item)
    const testData = [...appointment.subService]
    testData.forEach((item: any) => {
      item['vtmNumber'] = testMaps[item.subServiceId.toString()].vtmNumber
      item['labId'] = new mongoose.Types.ObjectId(testMaps[item.subServiceId.toString()].labId)
      item['consentForm'] = testMaps[item.subServiceId.toString()].consentForm
    })
    let query: any = {
      subService: testData,
      status: STATUS.SAMPLE_COLLECTED,
      collectionDate: new Date(),
      labCharges: totalPrice,
    };
    // if (vtmNumber) query.vtmNumber = vtmNumber;
    //@ts-ignore
    if (consentFormUrl) {
      query.consentFormUrl = consentFormUrl;
    }

    await this.appointmentRepository.update({ _id }, query);
    response.setSuccess("Sample collection successfully");
    return response
  };

  async cancelAppointment(arg0: { _id: string }, vehicleDTO: VehicleDTO, adminDTO: AdminDTO): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let { _id } = arg0;
    //@ts-ignore
    let adminUser: any; let VehicleUser: any
    if (!vehicleDTO) {
      adminUser = adminDTO._id;
    }

    else if (!adminDTO) {
      VehicleUser = vehicleDTO;
    }


    let appointmentData = await this.appointmentRepository.findOne({
      _id,
      status: {
        $nin: [
          STATUS.CANCELLED,
          STATUS.COMPLETED,
          STATUS.SAMPLE_COLLECTED,
        ],
      },
    })

    if (!appointmentData) {
      throw new ForbiddenError("You cannot cancel this appointment");
    }



    let comissionVat = appointmentData.vat;
    // let commission =
    (Number(appointmentData.price) / 100) * Number(comissionVat);
    // let totalPrice = Number(appointmentData.price) + commission;


    if (!adminDTO) {
      let data = vehicleDTO._id
      await this.bookingRepository.update(
        { _id: appointmentData.booking },
        {
          $inc: {
            noOfAppointments: -1,
          },
          cancelBy: data
        }
      )
      await this.appointmentRepository.update(
        { _id: appointmentData._id },
        { status: STATUS.CANCELLED, cancelBy: data }
      )
    }
    else if (!vehicleDTO) {
      let data = adminDTO._id

      await this.bookingRepository.update(
        { _id: appointmentData.booking },
        {
          $inc: {
            // price: - totalPrice,
            noOfAppointments: -1,
          },
          cancelBy: data
        }
      )

      await this.appointmentRepository.update(
        { _id: appointmentData._id },
        { status: STATUS.CANCELLED }
      )

      await this.appointmentRepository.update(
        { _id: appointmentData._id },
        { cancelBy: data }
      )
    }

    response.setSuccess("Appointment Cancelled");
    return response
  };


  async revertBackCancellation(revertBackDTO: { _id: string }): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let { _id } = revertBackDTO;

    let appointmentData = await this.appointmentRepository.findOne({ _id });

    if (appointmentData.status !== STATUS.CANCELLED)
      throw new ForbiddenError("Cannot Revert back this appointment");

    let bookingData = await this.bookingRepository.findOne({ _id: appointmentData.booking })

    if (
      bookingData.status === STATUS.SAMPLE_COLLECTED ||
      bookingData.status === STATUS.COMPLETED ||
      bookingData.status === STATUS.CANCELLED
    )
      throw new ForbiddenError("Cannot Revert this appointment");

    await this.appointmentRepository.update({ _id }, { status: bookingData.status });
    await this.bookingRepository.update(
      { _id: bookingData._id },
      {
        $inc: {
          noOfAppointments: 1,
        },
      }
    )
    response.setSuccess("Appointment is now active")
    return response;
  };

  async appointmentsSummary(summaryDTO: { date: string | Date }): Promise<ResponseModel<any>> {
    const response = new ResponseModel<any>();
    let { date = moment().format('YYYY-MM') } = summaryDTO;
    let selectedDate = moment(date, "YYYY-MM").format("YYYY-MM-DD")

    let totalAppointments = await this.appointmentRepository.getSummary(date)

    let totalBookings = await this.bookingRepository.find({ time: selectedDate })
    if (totalAppointments.length) {
      totalAppointments[0].totalBookings = totalBookings.length
        ? totalBookings.length
        : 0;
      response.setSuccessAndData(totalAppointments[0]);
      return response
    }
    let payload:any = {
      _id: 1,
      completed: 0,
      cancelled: 0,
      booked: 0,
      sampleCollected: 0,
      enRoute: 0,
      arrived: 0,
      sentToLab: 0,
      walkInSample: 0,
      homeSample: 0,
      total: 0,
      totalBookings: 0,
    };
    response.setSuccessAndData(payload);

    return response
  };
}

export default AppointmentService