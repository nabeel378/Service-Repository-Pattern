import Repository from "./repository";
import UserDTO from "../../models/dto-models/user.dto";
import IUserRepository from "../interfaces/iuser.repository";
import UserModel, { DB_NAME } from "../../models/repo-models/user.model"
import { injectable } from "inversify";

@injectable()
class UserRepository extends Repository<UserDTO> implements IUserRepository {
    model = UserModel
    COLLECTION_NAME: string = DB_NAME;


    getAllUser(query: Partial<UserDTO>, page: string | number, limit: string | number, skip: string | number) :Promise<any[]>{
        return this.aggregate([
            {
                $match: query,
            },
            {
                $facet: {
                    metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(page), limit } }],
                    data: [{ $skip: skip }, { $limit: Number(limit) },
                    {
                        $project: {
                            _id: 1,
                            password: 0,
                            __v: 0,
                            createdAt: 0,
                            updatedAt: 0,
                            type: 0,
                        },
                    },
                    ]
                }
            }
        ]) as any;
    }

}

export default UserRepository