import { model, Schema, Model } from 'mongoose';
import { APPOINTMENT_FOR, CAUSES, CUSTOMER_TYPE, INITIAL_PAYMENT_TYPE, PAYMENT_TYPE, STATUS, SYMPTOMS } from '../../enums/appointment.enum';
import { COMMISSION_TYPE } from '../../enums/subservice.enum';
import AppointmentDTO from '../dto-models/appointment.dto';
import { autoIncrement } from 'mongoose-plugin-autoinc-fix';

const DB_NAME = 'appointments';

const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const TestSchema = new Schema({
    subServiceId: { type: Schema.Types.ObjectId, required: true },
    labId: { type: Schema.Types.ObjectId, required: false,default:null },
    vtmNumber: { type: String, default:null},
    
    paymentType: {
        type: String,
        enum: Object.keys(PAYMENT_TYPE)
    },
    commissionType: {
        type: String,
        enum: Object.values(COMMISSION_TYPE)
    },
    commissionValue: {
        type: Number,
        default: 0
    },
    extraAmountIfNotCard: {
        type: Number,
        default: 0
    },
    amount: Number

})

const schema: Schema = new Schema({
    symptoms: {
        type: [{
            type: String,
            enum: Object.keys(SYMPTOMS)
        }],
    },
    appointmentId: {
        type: Number
    },
    vehicle: {
        type: Schema.Types.ObjectId,
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    slot: {
        type: Schema.Types.ObjectId,
    },
    covidTestCause: {
        type: String,
        enum: Object.values(CAUSES)
    },
    airlineName: {
        type: String,
    },
    flightDate: {
        type: Date
    },
    destination: {
        type: String
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    isNewForBooking: {
        type: Boolean,
        default: false
    },
    forCovidVaccination: {
        type: Boolean
    },
    subService: [TestSchema],

    user: {
        type: Schema.Types.ObjectId,
    },
    customerType: {
        type: String,
        enum: Object.keys(CUSTOMER_TYPE)
    },
    branch: {
        type: Schema.Types.ObjectId,
    },
    doctor: {
        type: Schema.Types.ObjectId,
    },
    time: {
        type: Date,
    },
    initialDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: Object.keys(STATUS)
    },
    vaccinationNumber: {
        type: String,
    },
    vaccination: {
        type: Schema.Types.ObjectId
    },
    expiresAt: {
        type: Date,
    },
    collectionDate: {
        type: Date,
    },
    appointmentFor: {
        type: String,
        anum: Object.keys(APPOINTMENT_FOR)
    },
    vat: {
        type: Number
    },
    price: {
        type: Number
    },
    commissionPaid: {
        type: Number,
        default: 0
    },
    commissionPending: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    paymentTypes: [{
        paymentType: {
            type: String,
            enum: Object.keys(PAYMENT_TYPE)
        },
        commissionType: {
            type: String,
            enum: Object.values(COMMISSION_TYPE)
        },
        commissionValue: {
            type: Number,
            default: 0
        },
        extraAmountIfNotCard: {
            type: Number,
            default: 0
        },
        amount: Number
    }],
    lat: {
        type: Number,
        default: 0
    },
    lng: {
        type: Number,
        default: 0
    },
    address: {
        type: String
    },
    addressTwo: {
        type: String
    },
    lab: {
        type: Schema.Types.ObjectId
    },
    vendor: {
        type: Schema.Types.ObjectId
    },
    labId: {
        type: String,
    },
    vtmNumber: {
        type: String
    },
    hosanId: {
        type: String
    },
    consentFormUrl: [{
        type: String
    }],
    vendorId: {
        type: String,
    },
    travelHistory: {
        type: String,
    },
    members: {
        type: [Schema.Types.ObjectId]
    },
    zone: {
        type: Schema.Types.ObjectId
    },
    booking: {
        type: Schema.Types.ObjectId
    },
    initialSubService: {
        type: Schema.Types.ObjectId
    },
    initialPrice: {
        type: Number
    },
    initialExtraAmountIfNotCard: {
        type: Number
    },
    mrNumber: {
        type: String,
    },
    remarks: [
        {
            admin: { type: Schema.Types.ObjectId },
            vehicle: { type: Schema.Types.ObjectId },
            remarks: { type: String }
        }
    ],
    history: [{
        flightDate: {
            type: Date
        },
        destination: {
            type: String
        }
    }],
    initialCommissionType: {
        type: String,
        enum: Object.values(COMMISSION_TYPE)
    },
    initialCommissionValue: {
        type: Number
    },
    initialPaymentType: {
        type: String,
        enum: Object.values(INITIAL_PAYMENT_TYPE),
    },
    changeCount: {
        type: Number,
    },
    admin: {
        type: Schema.Types.ObjectId
    },
    bookingId: {
        type: String
    },
    appointmentTime: {
        type: Date
    },
    bdo: {
        type: Schema.Types.ObjectId
    },
    region: {
        type: Schema.Types.ObjectId
    },
    labCharges: {
        type: Number,
        default: 0
    },
    cancelBy: {
        type: Schema.Types.ObjectId
    },
    isClear: {
        type: Boolean,
        default: false
    }
}, schemaOptions);

schema.plugin(autoIncrement, {
    model: 'appointments',
    field: 'appointmentId',
    startAt: 1,
    incrementBy: 1
});

const Appointment: Model<AppointmentDTO> = model<AppointmentDTO>(DB_NAME, schema);

export default Appointment
export { DB_NAME }
