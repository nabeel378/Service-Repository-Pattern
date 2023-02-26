import { model, Schema, Model } from 'mongoose';
import { CUSTOMER_TYPE } from '../../enums/appointment.enum';
import { STATUS, TYPE } from '../../enums/finance.enum';
import FinanceDTO from '../dto-models/finance.dto';

const DB_NAME = 'finances';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  status: {
    type: String,
    enum: Object.values(STATUS)
  },
  amount: {
    type: Number,
  },
  customerType: {
    type: String,
    enum: Object.values(CUSTOMER_TYPE)
  },
  vehicle: {
    type: Schema.Types.ObjectId
  },
  admin: {
    type: Schema.Types.ObjectId
  },
  financeAdmin: {
    type: Schema.Types.ObjectId
  },
  vendor: {
    type: Schema.Types.ObjectId
  },
  paymentType: {
    type: String,
    // enum: Object.values(finances.PAYMENT_TYPE)
  },
  type: {
    type: String,
    enum: Object.values(TYPE)
  },
  transactionDetails: {
    type: Object
  },
  booking: {
    type: Schema.Types.ObjectId
  },
  lab: {
    type: Schema.Types.ObjectId
  },
  time: {
    type: Date,
  },
  bdo: {
    type: Schema.Types.ObjectId
  },
  slipsUrls: [{
    type: String,
  }],
  noOfAppointments: {
    type: Number,
  }

}, schemaOptions);

const Checkin: Model<FinanceDTO> = model<FinanceDTO>(DB_NAME, schema);

export default Checkin
export { DB_NAME }
