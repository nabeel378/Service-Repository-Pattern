import { injectable } from "inversify";
import { FilterQuery, Model, ObjectId, SaveOptions, UpdateQuery} from "mongoose"
import ListDTO from "../../models/dto-models/list.dto";
import IBaseRepository from "../interfaces/Ibase.repository";
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

@injectable()
export default abstract class BaseRepository<T extends any> implements IBaseRepository<T> {
    /**
     * @description Create an instance of the MongooseService class
     * @param Model {mongoose.model} Mongoose Model to use for the instance
     */
    abstract model: Model<T>
    abstract COLLECTION_NAME: string;
    constructor() {
    }

    insertMany(docs: T[],option:{session?:any}) {
        return this.model.insertMany(docs,option)
    }

    pagination(options: any = { page: null, limit: 20, nestedPipelines: [] }) {
        // first check if pagination is active
        let skip;
        let { limit } = options;
        if (!options.page) {
            skip = 0;
            limit = Number.MAX_SAFE_INTEGER;
        } else {
            skip = (limit * options.page) - limit;
        }

        // create and return pipeline
        return [
            {
                $facet: {
                    metaData: [{ $count: 'totalDocuments' }, { $addFields: { page: options.page, limit } }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        ...(options.nestedPipelines ? options.nestedPipelines : []),
                    ],
                },
            },
            // handle empty responses
            {
                $project: {
                    data: 1,
                    metaData: { $ifNull: [{ $arrayElemAt: ['$metaData', 0] }, { totalDocuments: 0, page: options.page, limit }] },
                },
            },
        ];
    };

    /**
     * @description Create a new document on the Model
     * @param pipeline {array} Aggregate pipeline to execute
     * @returns {Promise} Returns the results of the query
     */
    async aggregate(pipeline: Array<any>, isPaginated: boolean = false, option: { page: number, limit: number } = { page: 1, limit: 10 }): Promise<ListDTO<T> | T[]> {
        const query = [
            ...pipeline,
        ]
        const paginateOption: { page: number, limit: number } = { page: option.page, limit: option.limit }

        if (isPaginated) {
            paginateOption.page = Number(option.page)
            paginateOption.limit = Number(option.limit)

            query.push(
                ...this.pagination({
                    ...paginateOption,
                    nestedPipelines: [
                        {
                            $sort: {
                                _id: -1
                            }
                        }
                    ],
                })
            )
        }


        let result = await this.model.aggregate(query).exec();
        if (isPaginated) {
            result = result[0]
        }
        return result
    }

    /**
     * @description Create a new document on the Model
     * @param body {object} Body object to create the new document with
     * @returns {Promise} Returns the results of the query
     */
    async create(body: any,options?: SaveOptions): Promise<T> {
        return await this.model.create<T>(body,options) as any;
        }

    /**
     * @description Count the number of documents matching the query criteria
     * @param query {object} Query to be performed on the Model
     * @returns {Promise} Returns the results of the query
     */
    count(query: Object): Promise<number> {
        return this.model.count(query).exec();
    }

    /**
     * @description Delete an existing document on the Model
     * @param id {string} ID for the object to delete
     * @returns {Promise} Returns the results of the query
     */
    hardDelete(id: ObjectId | Partial<T>): Promise<any> {
        return this.model.findByIdAndDelete(id).exec();
    }

    /**
     * @description Retrieve distinct "fields" which are in the provided status
     * @param query {object} Object that maps to the status to retrieve docs for
     * @param field {string} The distinct field to retrieve
     * @returns {Promise} Returns the results of the query
     */
    findDistinct(query: FilterQuery<T>, field: string) {
        return this.model
            .find(query)
            .distinct(field)
            .exec();
    }


    /**
     * @description Retrieve multiple documents from the Model with the provided
     *   query
     * @param query {object} - Query to be performed on the Model
     * @param {object} [projection] Optional: Fields to return or not return from
     * query
     * @param {object} [sort] - Optional argument to sort data
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    find(query: FilterQuery<T>, projection = { __v: 0 }, sort = { id: 1 }, options = { lean: true }): any {
        return this.model
            .find(query, projection, options)
            //@ts-ignore
            .sort(sort)
            .select({ __v: 0 })
        // .exec()
    }




    /**
     * @description Retrieve multiple documents from the Model with the provided
     *   query
     * @param query {object} - Query to be performed on the Model
     * @param {object} [projection] Optional: Fields to return or not return from
     * query
     * @param {object} [sort] - Optional argument to sort data
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    _findOne(query: FilterQuery<T>, projection = { __v: 0 }, sort = { id: 1 }, options = { lean: true }): any {
        return this.model
            .findOne(query, projection, options)
            //@ts-ignore
            .sort(sort)
            .select({ __v: 0 })
        // .exec()
    }

    /**
     * @description Retrieve a single document matching the provided ID, from the
     *   Model
     * @param id {string} Required: ID for the object to retrieve
     * @param {object} [projection] Optional: Fields to return or not return from
     * query
     * @param {object} [options] Optional: options to provide query
     * @returns {Promise} Returns the results of the query
     */
    findById(id: any, projection = { __v: 0 }, options = { lean: true }): Promise<any> {
        return this.model
            .findById(ObjectId(id), projection, options)
            .exec();
    }

    /**
     * @description Update a document matching the provided ID, with the body
     * @param id {string} ID for the document to update
     * @param body {object} Body to update the document with
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
     async update(id: FilterQuery<T>, body: UpdateQuery<T> | undefined, options: { lean: boolean, new: boolean, multiple?: boolean , session?:any} = { lean: true, new: true, multiple: false }): Promise<any> {
        if (options.multiple == true) {
            const response = await this.model
                .updateMany(id, body, options)
                .exec();
            if (response.acknowledged) {
                return this._findOne(id);
            } else {
                return null
            }
        } else {
            const response = await this.model
                .updateOne(id, body, options)
                .exec();
            if (response.acknowledged) {
                return this._findOne(id);
            } else {
                return null
            }
        }
    }



        /**
     * @description Update a document matching the provided ID, with the body
     * @param id {string} ID for the document to update
     * @param body {object} Body to update the document with
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
         async updateMany(id: FilterQuery<T>, body: UpdateQuery<T> | undefined, options?: { lean?: boolean, new?: boolean } ) {
                const response = await this.model
                    .updateMany(id, body, options)
                    .exec();
                if (response.acknowledged) {
                    return this._findOne(id);
                } else {
                    return null
                }
            
        }

    /**
     * @description Update a document matching the provided ID, with the body
     * @param id {string} ID for the document to update
     * @param body {object} Body to update the document with
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    updateOne(id: FilterQuery<T> | undefined, body: UpdateQuery<T>, options: any = { lean: true, new: true }): Promise<any> {
        return this.model
            .updateOne(id, body, options)
            .exec();
    }


}