import mongoose, { model, Schema, Model } from 'mongoose';
import LabDTO from '../dto-models/lab.dto';

const DB_NAME = 'labs';

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
  totalSamples: {
    type: Number,
    default: 0
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  totalAmountEarned: {
    type: Number,
    default: 0
  },
  subServicesOffered: [
    {
      subService: {
        type: mongoose.Schema.Types.ObjectId,
      },
      price: {
        type: Number,
        default: 0
      },
    }
  ]
}, schemaOptions);

schema.index({
  'name': 'text',
});

const Lab: Model<LabDTO> = model<LabDTO>(DB_NAME, schema);

export default Lab;
export { DB_NAME }
