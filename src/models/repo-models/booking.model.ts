import { model, Schema, Model } from 'mongoose';
import { CUSTOMER_TYPE, INITIAL_PAYMENT_TYPE, STATUS } from '../../enums/appointment.enum';
import { PAYMENT_TYPE } from '../../enums/finance.enum';
import BookingDTO from '../dto-models/booking.dto';
import { autoIncrement } from 'mongoose-plugin-autoinc-fix';

const DB_NAME = 'bookings';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  bookingId: {
    type: String,
  },
  noOfAppointments: {
    type: Number,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,

  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },

  paymentType: {
    type: String,
    enum: Object.values(PAYMENT_TYPE)
  },
  subService: {
    type: [Schema.Types.ObjectId],
    required: false,
    default: []
  },
  password: {
    type: String,
  },
  address: {
    type: String,
  },
  vendor: {
    type: Schema.Types.ObjectId,
  },
  vendorId: {
    type: String,
  },
  vehicle: {
    type: Schema.Types.ObjectId,
  },
  slot: {
    type: Schema.Types.ObjectId,
  },
  members: {
    type: [Schema.Types.ObjectId]
  },
  zone: {
    type: Schema.Types.ObjectId
  },
  lat: {
    type: Number,
    default: 0
  },
  lng: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  branch: {
    type: Schema.Types.ObjectId
  },
  time: {
    type: Date,
    required: false
  },
  price: {
    type: Number
  },
  customerType: {
    type: String,
    enum: Object.values(CUSTOMER_TYPE)
  },
  vat: {
    type: Number
  },
  addressTwo: {
    type: String,
  },
  status: {
    type: String,
    enum: Object.keys(STATUS),
    default: STATUS.BOOKED
  },
  initialSubServices: {
    type: [{
      subService: {
        type: Schema.Types.ObjectId
      },
      initialPrice: {
        type: Number
      }
    }],
    default: []
  },
  initialPaymentType: {
    type: String,
    enum: Object.values(INITIAL_PAYMENT_TYPE),
  },
  changeCount: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  // remarks: [
  //     {
  //         type: String,
  //     }
  // ],
  remarks: [
    {
      admin: { type: Schema.Types.ObjectId },
      vehicle: { type: Schema.Types.ObjectId },
      remarks: { type: String }
    }
  ],
  admin: {
    type: Schema.Types.ObjectId
  },
  appointmentTime: {
    type: Date
  },
  bdo: {
    type: Schema.Types.ObjectId
  },
  region: {
    type: Schema.Types.ObjectId
  },
  extraAmountIfNotCard: {
    type: Number,
    default: 0
  },
  cancelBy: {
    type: Schema.Types.ObjectId,
  }

}, schemaOptions);

schema.plugin(autoIncrement, {
  model: 'bookings',
  field: 'bookingId',
  startAt: 1,
  incrementBy: 1
});

const Booking: Model<BookingDTO> = model<BookingDTO>(DB_NAME, schema);

export default Booking
export { DB_NAME }
