import mongoose, { model, Schema, Model } from 'mongoose';
import { ROLES } from '../../enums/admin.enum';
import NotificationDTO from '../dto-models/notification.dto';

const DB_NAME = 'notifications';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
};

const schema: Schema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userType: {
    type: String,
    enum: Object.values(ROLES)
  },
}, schemaOptions);

const NotificationService: Model<NotificationDTO> = model<NotificationDTO>(DB_NAME, schema);

export default NotificationService
export { DB_NAME }
