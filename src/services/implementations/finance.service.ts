import { inject, injectable } from "inversify";
import moment from "moment";
import mongoose from "mongoose";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { CUSTOMER_TYPE, PAYMENT_TYPE, } from "../../enums/appointment.enum";
import { TYPE, STATUS } from "../../enums/finance.enum";
import FinanceDTO from "../../models/dto-models/finance.dto";
import IAdminRepository from "../../repositories/interfaces/iadmin.repository";
import IAppointmentRepository from "../../repositories/interfaces/iappointment.repository";
import IBookingRepository from "../../repositories/interfaces/ibooking.repository";
import IFinanceRepository from "../../repositories/interfaces/ifinance.repository";
import IMasterRepository from "../../repositories/interfaces/imaster.repository";
import IVehicleRepository from "../../repositories/interfaces/ivehicle.repository";
import IVendorRepository from "../../repositories/interfaces/ivendor.repository";
import StaticStringKeys from "../../utils/constant";
import { ResponseModel } from "../../utils/responsemodel";
import IFinanceService from "../interfaces/ifinance.service";

@injectable()
class FinanceService implements IFinanceService {
  constructor(
    @inject(SERVICE_IDENTIFIER.AppointmentRepository) private appointmentRepository: IAppointmentRepository,
    @inject(SERVICE_IDENTIFIER.BookingRepository) private bookingRepository: IBookingRepository,
    @inject(SERVICE_IDENTIFIER.FinanceRepository) private financeRepository: IFinanceRepository,
    @inject(SERVICE_IDENTIFIER.MasterRepository) private masterRepository: IMasterRepository,
    @inject(SERVICE_IDENTIFIER.VehicleRepository) private vehicleRepository: IVehicleRepository,
    @inject(SERVICE_IDENTIFIER.AdminRepository) private adminRepository: IAdminRepository,
    @inject(SERVICE_IDENTIFIER.VendorRepository) private vendorRepository: IVendorRepository,

  ) { }


  async bookingCompleteWalkIn(obj: { _id: string, status: STATUS }): Promise<ResponseModel<unknown>> {
    const response = new ResponseModel<unknown>();
    let { _id, status = STATUS.COMPLETED } = obj

    let session;

    session = await mongoose.startSession();
    session.startTransaction();

    let bookingDoc = await this.bookingRepository.findOne({ _id });

    let allAppointments = await this.appointmentRepository.find({ booking: _id, user: { $exists: true }, status: { $nin: [STATUS.CANCELLED] } });

    let totalCardAmount = 0;
    let totalCashAmount = 0;
    let totalCreditCardAmount = 0
    let totalOnlineAmount = 0
    let paidCommission = 0
    let pendingcommission = 0
    let vatTotalAmount = 0

    allAppointments.forEach(async (appointment) => {
      // cash 
      // vendor
      // bank

      if (appointment.paymentTypes.length == 1) {

        if (appointment.discount && appointment.discount > 0) {

          appointment.paymentTypes[0].amount = appointment.paymentTypes[0].amount - (appointment.paymentTypes[0].amount / 100) * appointment.discount
        }
        appointment.paymentTypes[0].amount = appointment.paymentTypes[0].amount + (appointment.paymentTypes[0].amount / 100) * appointment.vat
        vatTotalAmount = (appointment.paymentTypes[0].amount / 100) * appointment.vat
        if (appointment.paymentTypes[0].paymentType == PAYMENT_TYPE.CASH) {
          totalCashAmount += appointment.paymentTypes[0].amount

          pendingcommission += appointment.paymentTypes[0].commissionValue + appointment.paymentTypes[0].extraAmountIfNotCard

        } else if (appointment.paymentTypes[0].paymentType == PAYMENT_TYPE.CARD) {
          totalCardAmount += appointment.paymentTypes[0].amount

          paidCommission += appointment.paymentTypes[0].commissionValue

        } else if (appointment.paymentTypes[0].paymentType == PAYMENT_TYPE.ONLINE_TRANSFER) {
          totalOnlineAmount += appointment.paymentTypes[0].amount

          pendingcommission += appointment.paymentTypes[0].commissionValue + appointment.paymentTypes[0].extraAmountIfNotCard

        } else if (appointment.paymentTypes[0].paymentType == PAYMENT_TYPE.CREDIT_CARD) {
          totalCreditCardAmount += appointment.paymentTypes[0].amount

          pendingcommission += appointment.paymentTypes[0].commissionValue + appointment.paymentTypes[0].extraAmountIfNotCard

        }


      } else {

        totalCardAmount += appointment.paymentTypes[0].amount

        if (appointment.paymentTypes[1].paymentType == PAYMENT_TYPE.CASH) {
          totalCashAmount += appointment.paymentTypes[1].amount - appointment.paymentTypes[0].amount

          paidCommission += appointment.paymentTypes[0].commissionValue
          pendingcommission += appointment.paymentTypes[1].commissionValue - appointment.paymentTypes[0].commissionValue + appointment.paymentTypes[1].extraAmountIfNotCard

        } else if (appointment.paymentTypes[1].paymentType == PAYMENT_TYPE.ONLINE_TRANSFER) {

          totalOnlineAmount += appointment.paymentTypes[1].amount - appointment.paymentTypes[0].amount

          paidCommission += appointment.paymentTypes[0].commissionValue
          pendingcommission += appointment.paymentTypes[1].commissionValue - appointment.paymentTypes[0].commissionValue + appointment.paymentTypes[1].extraAmountIfNotCard


        } else if (appointment.paymentTypes[1].paymentType == PAYMENT_TYPE.CREDIT_CARD) {
          totalCreditCardAmount += appointment.paymentTypes[1].amount - appointment.paymentTypes[0].amount

          paidCommission += appointment.paymentTypes[0].commissionValue
          pendingcommission += appointment.paymentTypes[1].commissionValue - appointment.paymentTypes[0].commissionValue + appointment.paymentTypes[1].extraAmountIfNotCard


        }
      }
    })

    console.log("paidCommission", paidCommission)
    console.log("pendingcommission", pendingcommission)
    console.log("totalCardAmount", totalCardAmount)
    console.log("totalCashAmount", totalCashAmount)

    // throw new Error("...")

    let financesDoc = []
    // throw new Error("rrooooook")
    if (totalCardAmount) {

      let obj = {
        status: STATUS.COMPLETED,
        amount: totalCardAmount,
        paymentType: PAYMENT_TYPE.CARD,
        booking: bookingDoc._id,
        type: TYPE.USER_PAYMENT,
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
        type: TYPE.USER_PAYMENT,
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
        type: TYPE.USER_PAYMENT,
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
        status: STATUS.COMPLETED,
        amount: totalOnlineAmount,
        paymentType: PAYMENT_TYPE.ONLINE_TRANSFER,
        booking: bookingDoc._id,
        type: TYPE.USER_PAYMENT,
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

    if (paidCommission) {

      let obj = {
        status: STATUS.COMPLETED,
        amount: paidCommission,
        paymentType: TYPE.PAID_COMMISSION,
        booking: bookingDoc._id,
        type: TYPE.PAID_COMMISSION,
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
        vat: vatTotalAmount,
        totalRiderDue: totalCashAmount,
        totalVendorReceived: (totalCashAmount + totalCreditCardAmount + totalOnlineAmount) - pendingcommission,
        totalVendorEarned: ((totalCardAmount - paidCommission) + totalCashAmount + totalCreditCardAmount + totalOnlineAmount) - paidCommission,
        totalBankEarned: totalCreditCardAmount + totalOnlineAmount,
        totalCommissionEarned: paidCommission + pendingcommission,
        totalCommissionPaid: paidCommission
      }
    }, { session })

    if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
      await this.vehicleRepository.update({ _id: bookingDoc.vehicle }, { $inc: { totalAvailableAmount: totalCashAmount, totalReceivedAmount: totalCashAmount } }, { session })
    }

    if (bookingDoc.customerType == CUSTOMER_TYPE.WALK_IN) {
      // await Vendor.updateOne({ _id: bookingDoc.vendor }, { $inc: { totalEarned: totalCashAmount } }, { session })
      await this.adminRepository.update({ _id: bookingDoc.admin }, { $inc: { totalCashInHand: totalCashAmount, totalCollected: totalCashAmount } }, { session })
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
    }, { session })

    await this.appointmentRepository.updateMany({ booking: _id, user: { $exists: true }, status: { $nin: [STATUS.CANCELLED] } }, { status: STATUS.COMPLETED }, { session })
    let bookingPayload = {
      status
    }

    if (bookingDoc.customerType == CUSTOMER_TYPE.HOME_SAMPLE) {
      let body = {
        status: STATUS.COMPLETED,
        amount: totalCashAmount + totalCreditCardAmount + totalOnlineAmount + totalCardAmount,
        paymentType: PAYMENT_TYPE.CASH,
        booking: bookingDoc._id,
        vendor: bookingDoc.vendor,
        time: new Date(),
        type: TYPE.HOME_SAMPLE_REVENUE,
        bdo: bookingDoc.bdo,
        noOfAppointments: bookingDoc.noOfAppointments,
        vehicle: bookingDoc.vehicle
      } as unknown as FinanceDTO

      await this.financeRepository.create(body, { session })
    }

    await this.bookingRepository.update({ _id }, bookingPayload, { session })

    await session.commitTransaction();

    response.setSuccess(StaticStringKeys.SUCCESSFULL_UPDATE)
    return response
  }


  async getSalesData(queryDTO: { endDate: string, startDate: string, zone: string }):Promise<any> {

    const response = new ResponseModel<any>();
    if (!queryDTO.startDate && !queryDTO.endDate) {
      queryDTO.startDate = moment().startOf('month').format('YYYY-MM-DD');
      queryDTO.endDate = moment().endOf('month').format("YYYY-MM-DD");

    }

    let entity = await this.financeRepository.getSalesByDate(queryDTO.startDate, queryDTO.endDate, queryDTO.zone);
    response.setSuccessAndData(entity)
    return response
  }

  async getAll (queryDTO:{page: number, limit:number,type: string,startDate: string,endDate:string,admin:string, lab:string, vendor:string, bdo:string, vehicle:string}) :Promise<any> {
      // let { date } = req.query 
      const response = new ResponseModel<any>();
      let { page = 1, limit = 10, type = "HOME_SAMPLE", startDate, endDate, admin, lab, vendor, bdo, vehicle } = queryDTO

      let skip;
      if (!page) {
        skip = 0;
        limit = Number.MAX_SAFE_INTEGER;
      } else {
        skip = (Number(page) * Number(limit)) - Number(limit);
      }
      let query = {} as any
      let data;

      if (startDate && endDate) {
        let start = new Date(startDate)
        start.setHours(5, 0, 0, 0);
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.time = { $gte: start, $lte: end }
      }

      if (admin) {
        query.admin = new mongoose.Types.ObjectId(admin)
      }

      if (lab) {
        query.lab = new mongoose.Types.ObjectId(lab)
      }

      if (vendor) {
        query.vendor = new mongoose.Types.ObjectId(vendor)
      }

      if (bdo) {
        query.bdo = new mongoose.Types.ObjectId(bdo)
      }

      if (vehicle) {
        query.vehicle = new mongoose.Types.ObjectId(vehicle)
      }


      if (type === CUSTOMER_TYPE.HOME_SAMPLE) {

        query.customerType = CUSTOMER_TYPE.HOME_SAMPLE

        data = await this.financeRepository.getHomeSampleData(query, page, limit, skip)

      }

      if (type === CUSTOMER_TYPE.WALK_IN) {

        query.customerType = CUSTOMER_TYPE.WALK_IN

        data = await this.financeRepository.getWalkInData(query, page, limit, skip)
      }

      if (type === TYPE.HOME_SAMPLE_REVENUE) {

        query.type = TYPE.HOME_SAMPLE_REVENUE

        data = await this.financeRepository.getHomeSampleRev(query, page, limit, skip)
      }

      if (type === TYPE.VENDOR_PAYMENT) {

        query.type = TYPE.VENDOR_PAYMENT

        data = await this.financeRepository.getVendorPayment(query, page, limit, skip)
      }

      if (type === TYPE.VEHICLE_PAYMENT) {

        query.type = TYPE.VEHICLE_PAYMENT

        data = await this.financeRepository.getVehiclePaymentData(query, page, limit, skip)
      }

      if (type === TYPE.LAB_PAYMENT) {

        query.type = TYPE.LAB_PAYMENT

        data = await this.financeRepository.getLabPayments(query, page, limit, skip)
      }

      if (type === TYPE.BANK_PAYMENT) {

        query.type = TYPE.BANK_PAYMENT

        data = await this.financeRepository.getBankPayment(query, page, limit, skip)
      }

      if (type === TYPE.PAID_COMMISSION) {

        query.type = TYPE.PAID_COMMISSION

        data = await  this.financeRepository.getCommissionPayment(query, page, limit, skip)
      }

      if (type === TYPE.PAY_TO_ADMIN) {

        query.type = TYPE.PAY_TO_ADMIN

        data = await  this.financeRepository.getAdminPayments(query, page, limit, skip)
      }

      if (type === TYPE.BANK_DEPOSIT) {

        query.type = TYPE.BANK_DEPOSIT

        data = await  this.financeRepository.getDepositePayments(query, page, limit, skip)
      }

      // data = data.data

      let totalWalkIn = 0
      let totalHomeSample = 0
      let totalVehicle = 0
      let totalVendor = 0
      let totalBank = 0
      let totalCommission = 0
      let totalLab = 0
      let totalAdminPay = 0
      let totalDepositeToBank = 0
      let totalHomeSampleRevenue = 0

      if (type === CUSTOMER_TYPE.HOME_SAMPLE && data && data.totalData && data.totalData.length) {
        totalHomeSample = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === CUSTOMER_TYPE.WALK_IN && data && data.totalData && data.totalData.length) {
        totalWalkIn = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.VEHICLE_PAYMENT && data && data.totalData && data.totalData.length) {
        totalVehicle = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.VENDOR_PAYMENT && data && data.totalData && data.totalData.length) {
        totalVendor = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.HOME_SAMPLE_REVENUE && data && data.totalData && data.totalData.length) {
        totalHomeSampleRevenue = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.BANK_DEPOSIT && data && data.totalData && data.totalData.length) {
        totalDepositeToBank = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.PAY_TO_ADMIN && data && data.totalData && data.totalData.length) {
        totalAdminPay = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.BANK_PAYMENT && data && data.totalData && data.totalData.length) {
        totalBank = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.PAID_COMMISSION && data && data.totalData && data.totalData.length) {
        totalCommission = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      if (type === TYPE.LAB_PAYMENT && data && data.totalData && data.totalData.length) {
        totalLab = data.totalData[0].totalAmount ? data.totalData[0].totalAmount : 0
      }

      data.totalWalkIn = totalWalkIn
      data.totalHomeSample = totalHomeSample
      data.totalVehicle = totalVehicle
      data.totalVendor = totalVendor
      data.totalBank = totalBank
      data.totalCommission = totalCommission
      data.totalLab = totalLab
      data.totalAdminPay = totalAdminPay
      data.totalDepositeToBank = totalDepositeToBank
      data.totalHomeSampleRevenue = totalHomeSampleRevenue

      response.setSuccessAndData(data)
      return response
  }
}

export default FinanceService