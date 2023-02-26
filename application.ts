import express, { Application as ExApplication, Handler, NextFunction, RequestHandler } from 'express';
import { controllers } from './src/controllers/index.controller';
import { MetadataKeys } from './src/utils/metadata.keys';
import { IRouter } from './src/utils/decorators/handlers.decorator';
import asyncWrap from './src/utils/asyncwrapper';
import errorHandler from './src/errors/error.handler';
import { MissingFieldError } from './src/errors/app.error';
import initDB from './src/configs/database';


class Application {
  private readonly _instance: ExApplication;

  get instance(): ExApplication {
    initDB.connect()
    return this._instance;
  }

  constructor() {
    this._instance = express();
    this._instance.use(express.json());
    this.registerRouters();
    errorHandler(this._instance);

  }

  async configureDb() {
    /**
   * Configure mongoose
   **/
    await initDB.connect();
  }

  bodyStringValidators(keys: string[]): RequestHandler {
    return function (req: any, res: any, next: NextFunction) {
      if(!keys){
        next()
      }
      if (keys && keys.length !== 0 && !req.body) {
        throw new MissingFieldError("", "Invalid request")
      }

      for (let key of keys) {
        if (!req.body[key]) {
          throw new MissingFieldError(key, "is string required")
        } else if (typeof req.body[key] !== 'string') {
          throw new MissingFieldError(key, "is string required")
        }
      }

      next();
    };
  }

  
  bodyArrayValidators(keys: string[]): RequestHandler {
    return function (req: any, res: any, next: NextFunction) {
      if(!keys){
        next()
      }
      if (keys && keys.length !== 0 && !req.body) {
        throw new MissingFieldError("", "Invalid request")
      }

      for (let key of keys) {
        if (!req.body[key]) {
          throw new MissingFieldError(key, "is array required")
        } else if (typeof req.body[key] !== 'object') {
          throw new MissingFieldError(key, "is array required")
        }
      }

      next();
    };
  }

  bodyEmailValidators(keys: string[] = []): RequestHandler {
    return function (req: any, res: any, next: NextFunction) {
      if(!keys){
        next()
      }      if (keys && keys.length !== 0 && !req.body) {
        throw new MissingFieldError("", "Invalid request")
      }

      function validateEmail(email: string) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
      }


      for (let key of keys) {
        if (!req.body[key]) {
          throw new MissingFieldError(key, "is required")
        } else if (!validateEmail(req.body[key])) {
          throw new MissingFieldError(key, "is required")
        }
      }

      next();
    };
  }

  bodyNumberValidators(keys: string[] = []): RequestHandler {
    return function (req: any, res: any, next: NextFunction) {
      if(!keys){
        next()
      }
      if (keys && keys.length !== 0 && !req.body) {
        throw new MissingFieldError("", "Invalid request")
      }

      for (let key of keys) {
        if (!req.body[key]) {
          throw new MissingFieldError(key, "is number required")
        } else if (typeof req.body[key] !== 'number') {
          throw new MissingFieldError(key, "is number required")
        }
      }

      next();
    };
  }


  private registerRouters() {
    this._instance.get('/', (req, res) => {
      res.json({ message: 'Hello World!' });
    });

    const info: Array<{ api: string, handler: string }> = [];

    controllers.forEach((controllerClass) => {
      const controllerInstance: { [handleName: string]: Handler } = new controllerClass() as any;

      const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
      const routers: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);

      const exRouter = express.Router();

      routers.forEach(({ method, path, handlerName }) => {
        const requiredBodyProps = Reflect.getMetadata(MetadataKeys.VALIDATION, controllerInstance, handlerName) || [];
        let validator: any = []
        if (requiredBodyProps.length > 0) {
          const isStringRequiredList = Reflect.getMetadata(MetadataKeys.VALIDATION_IS_STRING, new requiredBodyProps[0]())
          const isNumberRequiredList = Reflect.getMetadata(MetadataKeys.VALIDATION_IS_NUMBER, new requiredBodyProps[0]())
          const isEMAILRequiredList = Reflect.getMetadata(MetadataKeys.VALIDATION_IS_EMAIL, new requiredBodyProps[0]())
          const isArrayRequiredList = Reflect.getMetadata(MetadataKeys.VALIDATION_IS_ARRAY, new requiredBodyProps[0]())
          if(isStringRequiredList){
            validator.push(this.bodyStringValidators(isStringRequiredList))
          }
          if(isNumberRequiredList){
            validator.push(this.bodyNumberValidators(isNumberRequiredList))
          }
          if(isEMAILRequiredList){
            validator.push(this.bodyEmailValidators(isEMAILRequiredList))
          }
          if(isArrayRequiredList){
            validator.push(this.bodyArrayValidators(isArrayRequiredList))
          }
        }

        const middleware: any[] = Reflect.getMetadata(MetadataKeys.MIDDLEWARE, controllerInstance, handlerName) || [];
        exRouter[method](path, ...middleware, validator, asyncWrap(controllerInstance[String(handlerName)].bind(controllerInstance)));

        info.push({
          api: `${method.toLocaleUpperCase()} ${basePath + path}`,
          handler: `${controllerClass.name}.${String(handlerName)}`,
        });
      });

      this._instance.use(basePath, exRouter);
    });

    console.table(info);
  }
}

export default new Application();
