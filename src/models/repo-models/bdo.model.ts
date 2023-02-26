import { model, Schema, Model } from 'mongoose';
import BDODTO from '../dto-models/bdo.dto';

const DB_NAME = 'businessDevelopmentOfficers';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String
  },
  isHidden: {
    type: Boolean,
    default: false
  },

}, schemaOptions);

const Admin: Model<BDODTO> = model<BDODTO>(DB_NAME, schema);

export default Admin
export { DB_NAME }
