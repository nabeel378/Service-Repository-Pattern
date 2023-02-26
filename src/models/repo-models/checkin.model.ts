import { model, Schema, Model } from 'mongoose';
import { CHECKIN_STATUS } from '../../enums/admin.enum';
import CheckinDTO from '../dto-models/checkin.dto';

const DB_NAME = 'checkIns';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
  },
  time: {
    type: Date,
    // default: new Date()
  },
  status: {
    type: String,
    enum: Object.values(CHECKIN_STATUS)
  },

}, schemaOptions);

const Checkin: Model<CheckinDTO> = model<CheckinDTO>(DB_NAME, schema);

export default Checkin
export { DB_NAME }
