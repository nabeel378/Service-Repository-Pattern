import Repository from "./repository";
import Model, { DB_NAME } from "../../models/repo-models/staff-member.model"
import { injectable } from "inversify";
import IStaffMemberRepository from "../interfaces/istaff-member.repository";
import StaffMemberDTO from "../../models/dto-models/staff-member.dto";

@injectable()
class StaffMemberRepository extends Repository<StaffMemberDTO> implements IStaffMemberRepository {
    model = Model
    COLLECTION_NAME: string = DB_NAME;

    getAllStaffMember(query:Object,arg2:{page:number, limit:number, skip:number}):Promise<any[]>{
        return this.aggregate([
            {
              $match: query
            },
            {
              $facet: {
                metaData: [{ $count: "totalDocuments" }, { $addFields: { page: Number(arg2.page),limit: Number(arg2.limit) } }],
                data: [{ $skip: arg2.skip }, { $limit: Number(arg2.limit) },
                {
                  $project: {
                    _id: 1,
                    password: 0,
      
                  },
                },
                ]
              }
            }
          ]) as Promise<any[]>;
    }

}

export default StaffMemberRepository