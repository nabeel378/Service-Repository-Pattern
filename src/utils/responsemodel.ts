export class ResponseModel<T> {
    //populate(entity: T): void;
    data?: T;
    statusCode?: number;
    isSuccess?: boolean;
    isServerError?: boolean;
    isUnAuthorized?: boolean;
    message?: string;
    dev_message?: string="";
    serverError?: string;

    constructor() {
        this.isSuccess = true;
    }

    setErrorAndData(data: T, message: string="ERROR",statusCode = 500): void {
        this.data = data;
        this.statusCode = statusCode
        this.isSuccess = false;
        this.isServerError = false;
        this.dev_message = '';
        this.message = message;
    }
    setError(message: string, isServerError: boolean = false,statusCode = 500): void {
        this.statusCode = statusCode
        this.isSuccess = false;
        this.message = message;
        this.data = undefined ;
        this.isServerError = isServerError;
    }
    setSuccess(message: string,statusCode = 200): void {
        this.isSuccess = true;
        this.statusCode = statusCode
        this.isServerError = false;
        this.message = message;
        this.data = null as any;
    }

    setSuccessAndData(data: T, message: string="SUCCESSFUL WORKING",statusCode = 200): void {
        this.data = data;
        this.statusCode = statusCode
        this.isSuccess = true;
        this.isServerError = false;
        this.dev_message = '';
        this.message = message;
    }

    setServerError(ex: any): void {
        this.serverError = ex;
        this.dev_message = ex.message
        this.data = null as any;
        this.setError("System Error", true,500);
    }

    setUnAuthorized(message: string): void {
        this.isUnAuthorized = true;
        this.data = undefined;
        this.setError(message,false,401);
    }
}