import logger from '../utils/logger';
const mongoose = require('mongoose')

/**
 * All the methods and properties mentioned in the following class is
 * specific to MongoDB. You should make necessary changes to support
 * the database you want to use.
 */

class Database {




    constructor() {
    }

    public async connect(): Promise<void> {

        const options = {

        };
        mongoose.connect(process.env.MONGO_URI, options).then(() => console.log(`DB is connected`))
            .catch((err: any) => console.log(err, "Error"))

    }

    public async disconnect() {
        //@ts-ignore
        if (this.dbClient.isConnected()) {
            logger.info(`Disconnected from`);
            //@ts-ignore
            await this.dbClient.close();
        }
    }



    public isDbConnected() {
        //@ts-ignore
        return this.dbClient && this.dbClient.isConnected();
    }
}

const db = new Database();

export default db;
