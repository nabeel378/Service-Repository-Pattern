import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import ICheckinRepository from "../../repositories/interfaces/icheckin.repository";
import { ResponseModel } from "../../utils/responsemodel";
import ICheckinService from "../interfaces/icheckin.service";
import { CHECKIN_STATUS } from "../../enums/admin.enum";
import CheckinDTO from "../../models/dto-models/checkin.dto";
import IFinanceRepository from "../../repositories/interfaces/ifinance.repository";
import FinanceToggleDTO from "../../models/dto-models/finance.toggle.dto";
import { MissingFieldError } from "../../errors/app.error";

@injectable()
class CheckinService implements ICheckinService {
  constructor(
    @inject(SERVICE_IDENTIFIER.CheckinRepository) private checkInRepository: ICheckinRepository,
    @inject(SERVICE_IDENTIFIER.FinanceRepository) private financeRepository: IFinanceRepository,
  ) { }


  async toggle(adminId: string, status: string): Promise<ResponseModel<any>> {
    const response = new ResponseModel<{}>
    let _id = adminId
    if (!_id)
      throw new MissingFieldError("_id Field is missing")

    let check: CheckinDTO = await this.checkInRepository.findOne({ admin: _id })

    if (status === CHECKIN_STATUS.CHECKIN && check && check.status === CHECKIN_STATUS.CHECKIN)
      throw new Error("Admin is already checked In")

    if (status === CHECKIN_STATUS.CHECKOUT && check && check.status === CHECKIN_STATUS.CHECKOUT)
      throw new Error("Admin is already checked Out")

    await this.checkInRepository.create({ admin: _id, status, time: new Date(), isHidden: false })

    let data: any
    if (status === CHECKIN_STATUS.CHECKOUT) {
      let checkInData = await this.checkInRepository.findOne({ admin: _id, status: CHECKIN_STATUS.CHECKIN })
      let dayStartTime = checkInData.time;

      let checkOutData = await this.checkInRepository.findOne({ admin: _id, status: CHECKIN_STATUS.CHECKOUT })
      let dayEndTime = checkOutData.time
      // let dayEndTime = new Date()
      // let dayEndTime = "2021-07-26T19:58:09.935Z"
      data = await this.financeRepository.getAllFinance(_id, dayStartTime, dayEndTime)

      data = data[0] as FinanceToggleDTO

      let totalDoctorPay = 0
      let totalCustomerPay = 0

      data && data.doctorPay && data.doctorPay.length && data.doctorPay.map((obj: { amount: any; }, i: any) => {
        totalDoctorPay = totalDoctorPay + Number(obj.amount)
      })

      data && data.customerPay && data.customerPay.length && data.customerPay.map((obj: { amount: any; }, i: any) => {
        totalCustomerPay = totalCustomerPay + Number(obj.amount)
      })

      data.totalCustomerPay = totalCustomerPay
      data.totalDoctorPay = totalDoctorPay
      data.checkInTime = dayStartTime
      data.checkOutTime = dayEndTime
      data.totalCashInHand = Number(totalCustomerPay) - Number(totalDoctorPay)
    }
    response.setSuccess(`User is successfully ${status === CHECKIN_STATUS.CHECKIN ? `Checked in` : `Checked out`}`)
    return response
  }


}

export default CheckinService