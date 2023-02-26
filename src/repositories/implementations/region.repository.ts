import Repository from "./repository";
import UserModel, { DB_NAME } from "../../models/repo-models/region.model"
import { injectable } from "inversify";
import RegionDTO from "../../models/dto-models/region.dto";
import IRegionRepository from "../interfaces/iregion.repository";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";

@injectable()
class RegionRepository extends Repository<RegionDTO> implements IRegionRepository {
    model = UserModel
    COLLECTION_NAME: string = DB_NAME;

    getAllRegion(query: Partial<RegionDTO>, paginateOption: BaseQueryDTO): Promise<ListDTO<any[]>> {
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

export default RegionRepository