import { model, Schema, Model } from 'mongoose';
import { CUSTOMER_TYPE } from '../../enums/appointment.enum';
import BranchDTO from '../dto-models/branch.dto';

const DB_NAME = 'branches';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  branchCode: {
    type: String,
  },
  openingTime: {
    type: Date
  },
  closingTime: {
    type: Date
  },
  address: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  zipCode: {
    type: String,
  },
  phone: {
    type: String,
  },
  testOffered: [
    {
      test: {
        type: Schema.Types.ObjectId,
      },
      homeSampleConsecutiveCustomers: {
        type: Number,
      },
      walkInConsecutiveCustomers: {
        type: Number,
      },
      homeSampleTestDuration: {
        type: Number,
      },
      walkInTestDuration: {
        type: Number,
      },
      testCases: [{
        type: String,
        enum: Object.keys(CUSTOMER_TYPE)
      }]
    },

  ],
  city: {
    type: Schema.Types.ObjectId,
    ref: 'city'
  },
  isHidden: {
    type: Boolean,
    default: false
  }

}, schemaOptions);

const Branch: Model<BranchDTO> = model<BranchDTO>(DB_NAME, schema);

export default Branch
export { DB_NAME }
