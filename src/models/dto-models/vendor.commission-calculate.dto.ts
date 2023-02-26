import { Schema } from "mongoose";
import { PAYMENT_TYPE } from "../../enums/appointment.enum";
import BaseDTO from "./base.dto";

class CommissionCalculateDTO extends BaseDTO {
  totalCommissionPercentage!: number;
  totalCommissionFixed!: number
  totalCommission!: number;
  subServiceId: string[] | Schema.Types.ObjectId[] = [];
  paymentType!: PAYMENT_TYPE
  commissionType!: string
  commissionValue!: number
  extraAmountIfNotCard!: number
  amount!: number
  totalAmount!: number
}

export default CommissionCalculateDTO;