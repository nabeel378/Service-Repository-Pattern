import mongoose, { model, Schema, Model } from 'mongoose';
import ServiceDTO from '../dto-models/service.dto';

const DB_NAME = 'services';

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
branch: {
    type: mongoose.Schema.Types.ObjectId
}
}, schemaOptions);

const Service: Model<ServiceDTO> = model<ServiceDTO>(DB_NAME, schema);

export default Service
export { DB_NAME }
