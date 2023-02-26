import { model, Schema, Model } from 'mongoose';
import { CUSTOMER_TYPE } from '../../enums/appointment.enum';
import { SUB_SERVICE_TYPE } from '../../enums/subservice.enum';
import { TYPE } from '../../enums/test.enum';
import SubServiceDTO from '../dto-models/subservice.dto';

const DB_NAME = 'subServices';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  service: {
    type: Schema.Types.ObjectId,
  },
  branch: {
    type: Schema.Types.ObjectId,
  },
  name: {
    type: String, 
    required: true,
  },
  serviceType: {
    type: String, // URGENT, NORMAL
    enum: Object.keys(SUB_SERVICE_TYPE),
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String, //COVID_TEST, COVID_VACINATION, NORMAL
    required: true,
    enum: Object.keys(TYPE),
  },
  reportGenerationHours: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
  },
  serviceCases: [
    {
      type: String,
      enum: Object.keys(CUSTOMER_TYPE),
    },
  ],
  isHidden: {
    type: Boolean,
    default: false,
  },
}, schemaOptions);

const SubService: Model<SubServiceDTO> = model<SubServiceDTO>(DB_NAME, schema);

export default SubService
export { DB_NAME }
