import mongoose from "mongoose";
import BaseQueryDTO from "../../models/dto-models/base.query.dto";
import ListDTO from "../../models/dto-models/list.dto";
import IBaseRepository from "./Ibase.repository";
/**
 * Interface Repository
 */
export default interface IRepository<T> extends IBaseRepository<T> {

    COLLECTION_NAME: string

    getAllWithPaginated(query: Object, BaseQuery: BaseQueryDTO): Promise<ListDTO<T>>
    /**
     * @author Muhammad Nabeel
     * @param key database coloumn name like _id,name
     * @param operator are using == ,!=
     * @param id value for finding
     * @returns {Promise} Returns the results of the query
     */
    findOneById(id: any):Promise<T>

    softDelete(_id: string|mongoose.Schema.Types.ObjectId): Promise<Boolean>
    
    /**
     * @author Muhammad Nabeel
     * @param key coloumn updated coloumn
     * @param _id value where update
     * @param keyObject push coloumn name
     * @param object push object
     */
    pushObject<T>(key: string, _id: any, keyObject: string, object: T):Promise<T>


    /**
     * @author Muhammad Nabeel
     * @param key coloumn updated coloumn
     * @param _id value where update
     * @param keyObject push coloumn name
     * @param object push object
     */
    pullObject<T>(query: { [key: string]: any }, keyObject: string, object: T): Promise<T>


    /**
     * @author Muhammad Nabeel
    * @param page skip record page*limit
    * @param limit no of records
    * @returns 
    */
    getWherePaginated(query: { [key: string]: any }, page: number, limit: number, projection?: any):Promise<T[]>


    /**
     * @author Muhammad Nabeel
     * @param page skip record of page
     * @param limit number of records
     * @param populate get data by reference of ObjectId
     * @param projection {Optional} Select Coloumn
     */
    getAllPaginatedPopulated(page: number, limit: number, populate: {}, projection?: {}):Promise<T[]>

    /**
         * @param query filter
         * @param page skip record of page
         * @param limit number of records
         * @param populate get data by reference of ObjectId
         * @param projection {Optional} Select Coloumn
         */
    getWherePaginatedPopulated(query: { [key: string]: string | number | object }, page: number, limit: number, populate: any, projection?: any, sort?: any):Promise<T>


    getCountWhere(query: { [key: string]: string | number }):Promise<any>

    /**
     * @author Muhammad Nabeel
     * @param key {string} column name
     * @param id {string|number|boolean} value of key 
     * @param populate {object|array}get data by reference of ObjectId
     */
    findOneByIdPopulated(key: any, id: any, populate: any):Promise<T>
    /**
     * @param key {string} key for the document column to find
     * @param value {string|number} for the document value to find
     * @returns 
     */
    findByKey(key: string, value: any):Promise<T>


    /**
     * @author Muhammad Nabeel
     * @param query {Object} where
     */
    findByMultipleWhere(query: any):Promise<T[]>

    updateByMultiWhere(query: any, object: any):Promise<any>

    getAllPaginatedWithOrder(page: number, limit: number, sort: any, projection?: any):Promise<[]>

    getAllPopulated(query: any, populate: any, projection?: any):Promise<[]>

    /**
     * 
     * @param query {Object} Query to be Perfomed on the model
     * @param quantity {Number} update number
     * @return boolean
     */
    updateQuantity(query: {}, quantity: number): Promise<Boolean>



    findOne(query?: Object, projection?: { __v: number; } | undefined | any): Promise<T>
}