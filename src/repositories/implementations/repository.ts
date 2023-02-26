import { injectable } from "inversify";
import mongoose, { FilterQuery, 
    UpdateQuery } from "mongoose";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import IRepository from "../interfaces/irepository";
import BaseRepository from "./base.repository"

@injectable()
export default abstract class Repository<T> extends BaseRepository<T> implements IRepository<T> {

    getAllWithPaginated(query: Object, BaseQuery: BaseQueryDTO): Promise<ListDTO<T>> {
        const result = this.aggregate([{ $match: { ...query ,isHidden:false} }], true, BaseQuery) as Promise<ListDTO<T>>;
        return result
    }
    /**
     * @author Muhammad Nabeel
     * @param key database coloumn name like _id,name
     * @param id value for finding
     * @returns {Promise} Returns the results of the query
     */
    findOneById(id: any) {
        return this.findOne({ _id: { $eq: id } })
    }

    /**
     * @author Muhammad Nabeel
     * @param key database coloumn name like _id,name
     * @param id value for finding
     * @param populate reference other table
     * @returns {Promise} Returns the results of the query
     */
    findOneByIdPopulated(key: any, id: any, populate: any): Promise<T extends any ? any : any> {
        return this.find({ [key]: { $eq: id } }).limit(1).populate(populate)
    }

    /**
     * @author Muhammad Nabeel
     * @param key coloumn name 
     * @param _id value for updating object
     * @param object push object 
     * @returns 
     */
    pushObject<K>(key: any, _id: any, keyObject: any, object: K) {
        return this.updateOne(
            { [key]: _id },
            { $push: { [keyObject]: object } }
        )
    }


    /**
    * @author Muhammad Nabeel
    * @param key coloumn name 
    * @param _id value for updating object
    * @param object push object 
    * @returns 
    */
    pullObject<K>(query: Object, keyObject: any, object: K) {
        return this.updateOne(
            query,
            { $pull: { [keyObject]: object } }
        )

    }

    /**
      * @author Muhammad Nabeel
      * @param page skip record page*limit
      * @param limit no of records
      * @returns 
      */
    getAllPaginatedPopulated(page: number, limit: number, populate: Object, projection = { __v: 0 }) {
        return this.find({}, projection).limit(limit).skip((page - 1) * limit).populate(populate)
    }


    /**
      * @author Muhammad Nabeel
      * @param populate get data by ref
      * @returns 
      */
    getAllPopulated(query: FilterQuery<T>, populate: any, projection = { __v: 0 }) {
        return this.find(query, projection).populate(populate)
    }


    /**
     * @author Muhammad Nabeel
     * @param page skip record page*limit
     * @param limit no of records
     * @returns 
     */
    getAllPaginatedWithOrder(page: number, limit: number, sort: Object, projection = { __v: 0 }) {
        return this.find({}, projection).limit(limit).skip((page - 1) * limit).sort(sort)
    }

    /**
     * @author Muhammad Nabeel
     * @
     * @param page skip record page*limit
     * @param limit no of records
     * @returns 
     */
    getWherePaginated(query: Object, page: number, limit: number, projection = { __v: 0 }) {
        return this.find(query, projection).limit(limit).skip((page - 1) * limit)
    }

    /**
     * @author Muhammad Nabeel
     * @
     * @param page skip record page*limit
     * @param limit no of records
     * @param populate reference other table
     * @returns 
     */
    getWherePaginatedPopulated(query: Object, page: number, limit: number, populate: any, projection = { __v: 0 }, sort = {}) {
        return this.find(query, projection).limit(limit).skip((page - 1) * limit).populate(populate).sort(sort)
    }

    /**
     * @author Muhammad Nabeel
     * @returns 
     */
    getCountWhere(query: Object) {
        return this.count(query)
    }



    /**
     * @author Muhammad Nabeel
     * @
      * @returns 
     */
    findByMultipleWhere(query: FilterQuery<T>, projection = { __v: 0 }) {
        return this.find(query, projection)
    }

    /**
     * @param key {string} key for the document column to find
     * @param value {string|number} for the document value to find
     * @returns 
     */
    findByKey(key: any, value: any) {
        return this.find({ [key]: value });
    }

    /**
     * @author Muhammad Nabeel
     * @param key coloumn
     * @param value updated by value
     * @param object  updated object 
     */
    async updateByOneWhere(key: any, value: any, object: UpdateQuery<T>) {
        await this.updateOne({ [key]: value }, object, {
            new: true,
            lean: false,
        })
        return this.findOne({ [key]: value })
    }

    async updateQuantity(query: {}, quantity: number): Promise<Boolean> {
        let result = await this.updateOne(query, { $inc: { quantity } })
        return result.acknowledged
    }

    /**
     * @author Muhammad Nabeel
     * @param object  updated object 
     */
    updateByMultiWhere(query: FilterQuery<T> | undefined, object: UpdateQuery<T>) {
        return this.updateOne(query, object, {
            new: true,
            lean: false
        })
    }

    async softDelete(_id: mongoose.Schema.Types.ObjectId): Promise<Boolean> {
        const result = await this.updateOne({ _id: _id }, { isHidden: true });
        return result.acknowledged
    }






    async findOne(query: Object = {}, projection = { __v: 0 }): Promise<T> {
        return this._findOne(query, projection)
    }


}

