import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/subservice.model"
import { injectable } from "inversify";
import ISubServiceRepository from "../interfaces/isubservice.repository";
import SubServiceDTO from "../../models/dto-models/subservice.dto";

@injectable()
class SubServiceRepository extends Repository<SubServiceDTO> implements ISubServiceRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;
    getAllSubService(query: Partial<SubServiceDTO>,paginated:{page:number,limit:number,skip:number}): Promise<any> {
        return this.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "services",
                    localField: "service",
                    foreignField: "_id",
                    as: "service"
                }
            },
            {
                $unwind: {
                    path: '$service',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(paginated.page), limit:paginated.limit } }],
                    data: [{ $skip: paginated.skip }, { $limit: Number(paginated.limit) },
                    {
                        $project: {
                            _id: 1,
                            password: 0,

                        },
                    },
                    ]
                }
            }
        ]);
    }

}

export default SubServiceRepository