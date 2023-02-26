import { model, Schema, Model } from 'mongoose';
import ZoneDTO from '../dto-models/zone.dto';

const DB_NAME = 'zones';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  regions: [{
    type: Schema.Types.ObjectId

  }],
  isHidden: {
    type: Boolean,
    default: false
  }
}, schemaOptions);

const Zone: Model<ZoneDTO> = model<ZoneDTO>(DB_NAME, schema);

export default Zone
export { DB_NAME }
