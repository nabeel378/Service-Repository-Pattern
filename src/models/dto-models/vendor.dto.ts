import { Schema } from "mongoose";
import { COMMISSION_TYPE } from "../../enums/subservice.enum";
import { COMMISSION_PAID_TO } from "../../enums/vendor.enum";
import { IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class VendorDTO extends BaseDTO {
  @IsString()
  name: string = ""
  isHidden: boolean = false
  inHouse: boolean = true;
  totalEarned: number = 0; 
  totalReceived: number = 0;
  totalCommissionEarned: number = 0;
  totalCommissionPaid: number = 0;
  companyName: string = "";
  phone: string = "";
  managerName: string = "";
  address: string = "";
  bdo!: Schema.Types.ObjectId
  vat: number = 0
  recordUrls: string[] = [];
  commissionPaidTo: COMMISSION_PAID_TO = COMMISSION_PAID_TO.VENDOR
  extraAmountIfNotCard: number = 0
  subServicesOffered: {
    subService: Schema.Types.ObjectId
    price: number
    commission: {
      type: COMMISSION_TYPE
      value: number
    },
    extraAmountIfNotCard: number
  }[] = []
  branch: any;
}

export default VendorDTO;