export class DataCopier{
    static copy(target: any,source:any): any {
        let response:any={};
        response={...response,...target};
    
        let keys = Object.keys(target);
        
        if (keys[0] == "0") {
            response={};
        }
        else {
            for (let key of keys) {
                
                if (target[key]) {
                    if (target[key].constructor === Array) {
                        response[key] = [];
                        console.log(key);
                        if(source[key] != undefined){
                            for (let item of source[key]) {
                                let data:any={...{},...item};
                                // data=UtilityService.convertToObject(item,item);
                                response[key].push(data);
                            }
                        }
                        //target[key]={...target[key],...source[key]};
                    }
                    else if (typeof target[key] === 'object') {
                        //console.log(key,typeof target[key]);
                        //let data:any=UtilityService.convertToObject(source[key],source[key]);
                        //console.log(JSON.stringify(data));
                        response[key] = source[key];
                        //console.log(key,JSON.stringify(target));
                    }
                    else {
                        if(source[key] != undefined){
                            response[key] = source[key];
                        }
                    }
                }
                else {
                    if(source[key] != undefined){

                        response[key] = source[key];
                    }
                }

            }
         }
        return response;
    
    }

}