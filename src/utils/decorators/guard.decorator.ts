import { RequestHandler } from 'express';
import { MetadataKeys } from '../metadata.keys';

const UseGuard = (middleware: RequestHandler | RequestHandler) => {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    let middlewares =
      Reflect.getMetadata(MetadataKeys.MIDDLEWARE, target, key) || [];

    middlewares.push(middleware);
    Reflect.defineMetadata(MetadataKeys.MIDDLEWARE, middlewares, target, key);
  };

}
export default UseGuard;