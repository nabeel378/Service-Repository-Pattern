import mongoose from "mongoose";

type ClientSession = mongoose.ClientSession;

export default interface UnitOfWork {

  session: ClientSession | null;

  start(): Promise<void>

  commit(): Promise<void>

  rollback(): Promise<void>
  
}