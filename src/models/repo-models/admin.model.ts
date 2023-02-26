import { model, Schema, Model } from 'mongoose';
import { ROLES, STATUS } from "../../enums/admin.enum"
import AdminDTO from '../dto-models/admin.dto';

const DB_NAME = 'admin';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: Object.values(STATUS),
    default: STATUS.ACTIVE
  },
  twoFaSecret: {
    type: Schema.Types.Mixed,
    default: {}
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
  },
  maxDiscount: {
    type: Number,
  },
  totalCashInHand: {
    type: Number,
  },
  totalCollected: {
    type: Number,
  },
  roles: {
    type: Object,
    DASHBOARD: {
      type: Array,
      default: []
    },
    CUSTOMERS: {
      type: Array,
      default: []

    },
    SERVICES: {
      type: Array,

    },
    SUBSERVICES: {
      type: Array,

    },
    APPOINTMENTS: {
      type: Array,
      default: []

    },
    BOOKING: {
      type: Array,

    },
    DOWNLOAD: {
      type: Array,

    },
    DRIVER: {
      type: Array,

    },
    REGION: {
      type: Array,

    },
    ZONE: {
      type: Array,
    },
    APP_USER: {
      type: Array,
      default: []
    },
    LABS: {
      type: Array,
      default: []
    },
    VENDORS: {
      type: Array,
      default: []

    },
    GOOGLE: {
      type: Array,
      default: []
    },
    CALENDE: {
      type: Array,
    },
    ADMINS: {
      type: Array,
    },
    CITIES: {
      type: Array,
      default: []
    },
    BRANCH: {
      type: Array,
      default: []
    },
    BDO: {
      type: Array,
      default: []
    },
    VENDOR_SERVICES: {
      type: Array,
      default: []
    },
    APP_USER_FINANCE: {
      type: Array,
      default: []
    },
    LABS_SERVICES: {
      type: Array,
      default: []
    },
    LABS_FINANCE: {
      type: Array,
      default: []
    },
    VENDOR_FINANCE: {
      type: Array,
      default: []
    },
    CONSENTFORM: {
      type: Array,
      default: []
    },
    LEADS: {
      type: Array,
      default: []
    },
    EVENTS: {
      type: Array,
      default: []
    },

  },
  totpSecret: {
    type: Schema.Types.Mixed,
    default: {}
  },
  deviceToken: {
    type: String
  }

}, schemaOptions);

const Admin: Model<AdminDTO> = model<AdminDTO>(DB_NAME, schema);

export default Admin
export { DB_NAME }
