import { model, Schema, Model } from 'mongoose';
const { autoIncrement } = require('mongoose-plugin-autoinc-fix');
import { GENDER, RELATION, RESIDENTORVISITOR, TYPE } from '../../enums/user.enum';
import UserDTO from '../dto-models/user.dto';

const DB_NAME = 'users';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  mrNumber: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
    default: ""
  },
  dob: {
    type: Date,
  },
  phone: {
    type: String,
  },
  gender: {
    type: String,
    enum: Object.keys(GENDER),
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  eid: {
    type: String,
  },
  passportNumber: {
    type: String,
  },
  type: {
    type: String,
    enum: Object.keys(TYPE),
  },
  forgetPassword: {
    otp: {
      type: String
    },
    expiresAt: {
      type: Number,
    },
  },
  relation: {
    type: String,
    enum: Object.keys(RELATION),
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  residentOrVisitor: {
    type: String,
    enum: Object.keys(RESIDENTORVISITOR),
  },
  jobDescription: {
    type: String
  },
  companyName: {
    type: String
  },
  nationality: {
    type: String
  },
  eidImageUrls: [{
    type: String,
  }],
  occupation: {
    type: String,
    // enum: Object.values(UserConstant.OCCUPATION),
  },
  area: {
    type: String,
  },
  institute: {
    type: String,
  },
  campName: {
    type: String,
  },
  supervisorName: {
    type: String,
  },
  supervisorNumber: {
    type: String,
  },
  grade: {
    type: String,
  },
  officeAddress: {
    type: String,
  },
  address: {
    type: String,
  },
  addressTwo: {
    type: String,
  }
}, schemaOptions);

schema.index({
  'firstName': 'text',
  'email': 'text',
  'phone': 'text',
  'eid': 'text',
  'passportNumber': 'text',
  // 'mrNumber': 'text',
});

schema.plugin(autoIncrement, {
  model: 'users',
  field: 'mrNumber',
  startAt: 1,
  incrementBy: 1
});

const User: Model<UserDTO> = model<UserDTO>(DB_NAME, schema);

export default User
export { DB_NAME }
