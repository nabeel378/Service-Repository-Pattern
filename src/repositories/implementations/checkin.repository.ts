import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/checkin.model"
import { injectable } from "inversify";
import ICheckinRepository from "../interfaces/icheckin.repository";
import CheckinDTO from "../../models/dto-models/checkin.dto";

@injectable()
class CheckinRepository extends Repository<CheckinDTO> implements ICheckinRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;


}

export default CheckinRepository