import Repository from "./repository";
import UserModel, { DB_NAME } from "../../models/repo-models/zone.model"
import { injectable } from "inversify";
import ZoneDTO from "../../models/dto-models/zone.dto";
import IZoneRepository from "../interfaces/izone.repository";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";

@injectable()
class ZoneRepository extends Repository<ZoneDTO> implements IZoneRepository {
    model = UserModel
    COLLECTION_NAME: string = DB_NAME;

    getAllZone(query: Partial<ZoneDTO>, paginateOption: BaseQueryDTO): Promise<ListDTO<any[]>> {
        return this.aggregate([
            {
                $match: query,
            },
            {
                $lookup: {
                    from: 'regions',
                    localField: 'regions',
                    foreignField: '_id',
                    as: 'regions',
                },
            },
            {
                $addFields: {
                    regions: {
                        $filter: {
                            input: "$regions",
                            as: "item",
                            cond: { $eq: ["$$item.isHidden", false] }
                        }
                    }
                }
            },
        ], true, paginateOption) as unknown as Promise<ListDTO<any[]>>

    }
}

export default ZoneRepository