import { FilterQuery, ObjectId, SaveOptions, UpdateQuery } from "mongoose"
import ListDTO from "../../models/dto-models/list.dto"

/**
 * Interface Base Repository
 */
export default interface IBaseRepository<T> {

    insertMany(docs: T[],option?:{session?:any}): any

    /**
    * @author Muhammad Nabeel
    * @description Aggregation
    * @param pipeline 
    */
    aggregate(pipeline: Array<any>, isPaginated: boolean, option: { page: number, limit: number }): Promise<ListDTO<T> | T[]>
    /**
    * @author Muhammad Nabeel
    * @description insert data in table
    * @param body {object} Body object to create the new document with
    */
    create(body: T,options?: SaveOptions): Promise<any>

    /**
    * @author Muhammad Nabeel
    * @description Delete an existing document on the Model
    * @param id {String} Id for the object to delete
    */
    hardDelete(id: ObjectId | Partial<T>): Promise<any>

    /**
    * @author Muhammad Nabeel
    * @description Retrieve distinct "fields" which are in the provided status
    * @param query {Object} for tbe Select In Table 
    * @param field {Objedct} for Distint
    */
    findDistinct(query: Object, field: Object): Promise<any>

    /**
    * @author Muhammad Nabeel
    * @description Retrieve multiple documents from the Model with the provided
    *   query
    * @param query {object} - Query to be performed on the Model
    * @param {object} [projection] Optional: Fields to return or not return from
    * query
    * @param {object} [sort] - Optional argument to sort data
    * @param {object} [options] Optional options to provide query
    * @returns {Promise} Returns the results of the query
    */
    find(query: FilterQuery<T>, projection?: Object, sort?: Object, options?: Object): Promise<T[]>

    /**
    * @author Muhammad Nabeel
    * @description Retrieve a single document matching the provided ID, from the
    *   Model
    * @param id {string} Required: ID for the object to retrieve
    * @param {object} [projection] Optional: Fields to return or not return from
    * query
    * @param {object} [options] Optional: options to provide query
    * @returns {Promise} Returns the results of the query
    */
    findById(id: any, projection?: Object, options?: Object): Promise<T>

    /**
    * @author Muhammad Nabeel
    * @description Update a document matching the provided ID, with the body
    * @param id {string} ID for the document to update
    * @param body {object} Body to update the document with
    * @param {object} [options] Optional options to provide query
    * @returns {Promise} Returns the results of the query
    */
     update(id: FilterQuery<T>, body: UpdateQuery<T> | undefined, options?: { lean?: boolean, new?: boolean, multiple?: boolean, session?:any } ): Promise<T>


         /**
    * @author Muhammad Nabeel
    * @description Update a document matching the provided ID, with the body
    * @param id {string} ID for the document to update
    * @param body {object} Body to update the document with
    * @param {object} [options] Optional options to provide query
    * @returns {Promise} Returns the results of the query
    */
    updateMany(id: FilterQuery<T>, body: UpdateQuery<T> | undefined, options?: { lean?: boolean, new?: boolean,session?:any } ): Promise<T>

    }