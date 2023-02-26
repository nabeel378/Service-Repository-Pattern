import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/branch.model"
import { injectable } from "inversify";
import IBranchRepository from "../interfaces/ibranch.repository";
import BrnachDTO from "../../models/dto-models/branch.dto";

@injectable()
class BranchRepository extends Repository<BrnachDTO> implements IBranchRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;


}

export default BranchRepository