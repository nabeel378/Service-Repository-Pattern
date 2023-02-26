import { model, Schema, Model } from 'mongoose';
import { GENDER } from '../../enums/user.enum';
import { STATUS } from '../../enums/vehicle.enum';
import VehicleDTO from '../dto-models/vehicle.dto';

const DB_NAME = 'vehicles';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  status: {
    type: String,
    enum: Object.values(STATUS),
    default: STATUS.ACTIVE
  },
  name: {
    type: String
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  members: [{
    member: {
      type: Schema.Types.ObjectId,
      ref: "staffMembers"
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    }
  }],
  licencePlate: {
    type: String
  },
  gender: {
    type: String,
    enum: Object.keys(GENDER),
  },
  dob: {
    type: Date,
  },
  color: {
    type: String
  },
  email: {
    type: String
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
  },
  totalAvailableAmount: {
    type: Number,
    default: 0
  },
  totalReceivedAmount: {
    type: Number,
    default: 0
  },
  subServices: [{
    type: Schema.Types.ObjectId,
    ref: "subServices "
  }],


}, schemaOptions);
schema.index({ location: '2dsphere' });

schema.index({
  'firstName': 'text',
  'lastName': 'text',
  'licencePlate': 'text',
});

const Vehicle: Model<VehicleDTO> = model<VehicleDTO>(DB_NAME, schema);

export default Vehicle
export { DB_NAME }
