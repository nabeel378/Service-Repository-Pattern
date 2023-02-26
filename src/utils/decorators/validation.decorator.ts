import { MetadataKeys } from '../metadata.keys';

const Validation = (instance: any): any => {
  //@ts-ignore
  return (target: any, key: string, desc: PropertyDescriptor) => {
    Reflect.defineMetadata(MetadataKeys.VALIDATION, [instance], target, key);
  };
}


const IsString = (): any => {

  return (target: any, key: string, desc: PropertyDescriptor) => {
    //@ts-ignore
    let data =
      Reflect.getMetadata(MetadataKeys.VALIDATION_IS_STRING, target) || [];
    data.push(key)
    Reflect.defineMetadata(MetadataKeys.VALIDATION_IS_STRING, data, target);
  };
}


const IsArray = (): any => {

  return (target: any, key: string, desc: PropertyDescriptor) => {
    //@ts-ignore
    let data =
      Reflect.getMetadata(MetadataKeys.VALIDATION_IS_ARRAY, target) || [];
    data.push(key)
    Reflect.defineMetadata(MetadataKeys.VALIDATION_IS_ARRAY, data, target);
  };
}

const IsEmail = (): any => {

  return (target: any, key: string, desc: PropertyDescriptor) => {
    //@ts-ignore
    let data =
      Reflect.getMetadata(MetadataKeys.VALIDATION_IS_EMAIL, target) || [];
    data.push(key)
    Reflect.defineMetadata(MetadataKeys.VALIDATION_IS_EMAIL, data, target);
  };
}


const IsNumber = (): any => {

  return (target: any, key: string, desc: PropertyDescriptor) => {
    //@ts-ignore
    let data =
      Reflect.getMetadata(MetadataKeys.VALIDATION_IS_NUMBER, target) || [];
    data.push(key)
    Reflect.defineMetadata(MetadataKeys.VALIDATION_IS_NUMBER, data, target);
  };
}
export { IsString, IsNumber, IsEmail, IsArray }
export default Validation;
