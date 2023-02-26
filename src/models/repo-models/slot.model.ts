import { model, Schema, Model } from 'mongoose';
import { CUSTOMER_TYPE } from '../../enums/appointment.enum';
import { STATUS } from '../../enums/slot.enum';
import SlotDTO from '../dto-models/slot.dto';
import { DB_NAME  as BranchDB } from './branch.model'

const DB_NAME = 'slots';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  subService: {
    type: Schema.Types.ObjectId,
    ref: 'test'
},
type: {
    type: String,
    required: true,
    enum: Object.keys(CUSTOMER_TYPE)
},
branch: {
    type: Schema.Types.ObjectId,
    ref: BranchDB
},
doctor: {
    type: Schema.Types.ObjectId,
    ref: 'doctors'
},
startTime: {
    type: Date
},
endTime: {
    type: Date
},
status: {
    type: String,
    enum: Object.keys(STATUS),
    default: STATUS.ACTIVE
},
duration: {
    type: Number
}

}, schemaOptions);

const Slot: Model<SlotDTO> = model<SlotDTO>(DB_NAME, schema);

export default Slot
export { DB_NAME }
