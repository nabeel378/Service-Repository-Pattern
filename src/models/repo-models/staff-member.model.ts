import mongoose, { model, Schema, Model } from 'mongoose';
import { GENDER, TYPE } from '../../enums/user.enum';
import StaffMemberDTO from '../dto-models/staff-member.dto';

const DB_NAME = 'staffMembers';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  isHidden: {
    type: Boolean,
    default: false
  },
  staffGroup: {
    type: mongoose.Schema.Types.ObjectId,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
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
  type: {
    type: String,
    default: TYPE.STAFF_MEMBER
  }
}, schemaOptions);

schema.index({
  'name': 'text'
});

const StaffMember: Model<StaffMemberDTO> = model<StaffMemberDTO>(DB_NAME, schema);

export default StaffMember
export { DB_NAME }
