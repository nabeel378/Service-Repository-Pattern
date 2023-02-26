import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/service.model"
import { injectable } from "inversify";
import IServiceRepository from "../interfaces/iservice.repository";
import ServiceDTO from "../../models/dto-models/service.dto";

@injectable()
class ServiceRepository extends Repository<ServiceDTO> implements IServiceRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

  
}

export default ServiceRepository