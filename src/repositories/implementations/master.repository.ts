import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/master.model"
import { injectable } from "inversify";
import masterRepository from "../interfaces/imaster.repository";
import MasterDTO from "../../models/dto-models/master.dto";

@injectable()
class MasterRepository extends Repository<MasterDTO> implements masterRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;


}

export default MasterRepository