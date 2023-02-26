import Repository from "./repository";
import NotificationDTO from "../../models/dto-models/notification.dto";
import NotificationModel,{DB_NAME} from "../../models/repo-models/notification.model"
import { injectable } from "inversify";
import INotificationRepository from "../interfaces/inotification.repository";

@injectable()
class NotificationRepository extends Repository<NotificationDTO> implements INotificationRepository {
    model = NotificationModel
    COLLECTION_NAME: string = DB_NAME;

}

export default NotificationRepository