import { model, Schema, Model } from 'mongoose';
import MasterDTO from '../dto-models/master.dto';

const DB_NAME = 'masters';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  vat: {
    type: Number,
    default: 0,
},
totalRiderDue: {
    type: Number,
    default: 0,
}, // Riders se itna paise lena baaqi hai
totalRiderReceived: {
    type: Number,
    default: 0
}, // Riders se ab tk total itna paisa le chuke hain
totalVendorEarned: {
    type: Number,
    default: 0,
}, // Vendors se kitna kamaya hai aj tk paid unpaid duno
totalVendorReceived: {
    type: Number,
    default: 0
}, // Vendors se kitna paise receive ho gya hai aj 
totalBankEarned: {
    type: Number,
    default: 0,
}, // Bank se kitna kamaya hai aj tk paid unpaid duno
totalBankReceived: {
    type: Number,
    default: 0
}, // Bank se kitna paise receive ho gya hai aj tk
totalCommissionEarned: {
    type: Number,
    default: 0,
}, // kitna comission aj tak sab vendors ne kamaya
totalCommissionPaid: {
    type: Number,
    default: 0
}, // kitna commission aj tak sab vendors ko mil gya qam se
totalLabPaid: {
    type: Number,
    default: 0,
}, // kitna lab ko paisa dya
administrationNumber: {
    type: String,
    default: '+971 4355 6643'
},
totalQamRevinue: {
    type: String,
},
mrNumberCount: {
    type: Number,
    default: 0
}
}, schemaOptions);

const Master: Model<MasterDTO> = model<MasterDTO>(DB_NAME, schema);

export default Master
export { DB_NAME }
