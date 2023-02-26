import { injectable } from "inversify";
import mongoose from "mongoose";

type ClientSession = mongoose.ClientSession;

@injectable()
class UnitOfWork implements UnitOfWork {
    session: ClientSession | null;
    
    constructor() {
        this.session = null
    }

    async start() {
        this.session = await mongoose.startSession();
        this.session.startTransaction();
    }

    async commit() {
        await this.session!.commitTransaction();
        this.session!.endSession();
    }

    async rollback() {
        await this.session!.abortTransaction();
        this.session!.endSession();
    }
}

export default  UnitOfWork
