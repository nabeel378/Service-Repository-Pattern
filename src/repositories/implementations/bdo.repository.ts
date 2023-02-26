import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/bdo.model"
import { injectable } from "inversify";
import IBdoRepository from "../interfaces/ibdo.repository";
import BDODTO from "../../models/dto-models/bdo.dto";

@injectable()
class BdoRepository extends Repository<BDODTO> implements IBdoRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;


}

export default BdoRepository