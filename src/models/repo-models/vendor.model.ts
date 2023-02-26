import { model, Schema, Model } from 'mongoose';
import { COMMISSION_TYPE } from '../../enums/subservice.enum';
import { COMMISSION_PAID_TO } from '../../enums/vendor.enum';
import VendorDTO from '../dto-models/vendor.dto';

const DB_NAME = 'vendors';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    inHouse: {
        type: Boolean,
        default: false
    },
    totalEarned: {
        type: Number,
        default: 0
    },   /*  total kamai */
    totalReceived: {
        type: Number,
        default: 0
    },/*  total vendor se qam ko me han  */
    totalCommissionEarned: {
        type: Number,
        default: 0
    },
    totalCommissionPaid: {
        type: Number,
        default: 0
    },
    companyName: {
        type: String,
    },
    phone: {
        type: String,
    },
    managerName: {
        type: String,
    },
    address: {
        type: String,
    },
    bdo: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    vat: {
        type: Number
    },
    recordUrls: [{
        type: String,
    }],
    commissionPaidTo: {
        type: String,
        enum: Object.values(COMMISSION_PAID_TO),
        default: COMMISSION_PAID_TO.VENDOR
    },
    extraAmountIfNotCard: {
        type: Number,
        default: 0
    },
    subServicesOffered: [
        {
            subService: {
                type: Schema.Types.ObjectId,
            },
            price: {
                type: Number
            },
            commission: {
                type: {
                    type: String,
                    enum: Object.values(COMMISSION_TYPE)
                },
                value: {
                    type: Number
                }
            },
            extraAmountIfNotCard: {
                type: Number,
                default: 0
            },
        }
    ]

}, schemaOptions);

const Vendor: Model<VendorDTO> = model<VendorDTO>(DB_NAME, schema);

export default Vendor
export { DB_NAME }
