import { model, Schema, Model } from 'mongoose';
import RegionDTO from '../dto-models/region.dto';

const DB_NAME = 'regions';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  localities: [{
    type: String
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  zone: {
    type: Schema.Types.ObjectId
  }
}, schemaOptions);

schema.index({
  'name': 'text'
});

const Region: Model<RegionDTO> = model<RegionDTO>(DB_NAME, schema);

export default Region
export { DB_NAME }
