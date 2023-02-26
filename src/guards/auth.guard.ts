import { NextFunction } from "express";
import { resolve } from "../../dependencymanagement";
import SERVICE_IDENTIFIER from "../../identifiers";
import { ROLES } from "../enums/defaults.enum";
import IAdminService from "../services/interfaces/iadmin.service";
import IUserService from "../services/interfaces/iuser.service";
import IVehicleService from "../services/interfaces/ivehicle.service";
import { ResponseModel } from "../utils/responsemodel";
const jwt = require("jsonwebtoken")

function getAdminService(): IAdminService {
    return resolve<IAdminService>(SERVICE_IDENTIFIER.AdminService);
}
const adminService = getAdminService();

function getUserService(): IUserService {
    return resolve<IUserService>(SERVICE_IDENTIFIER.UserService);
}
const userService = getUserService();

function getVehicleService(): IVehicleService {
    return resolve<IVehicleService>(SERVICE_IDENTIFIER.VehicleService);
}
const vehicleService = getVehicleService();

// export const checkJwt = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNWJhOTNhYjk1NzZjZjk2OTAyZmZiMyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY3MDU3ODE4OCwiZXhwIjoxNjcwNjMyMTg4fQ.PWXpRfBpcYszkLlgFj5bbORl0D8vQQommlzX42jAc6Q","0a6b944d-d2fb-46fc-a85e-0295c986cd9");
export const Auth = async (
    req: any,
    _res: any,
    next: NextFunction
): Promise<ResponseModel<{}>> => {
    const response = new ResponseModel<{}>()
    if (req.path.search('login') !== -1) {
        return response
    }
    try {

        const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : ''
        const data = jwt.verify(token, process.env.JWT_SECRET)
        const modal = data.role
        let token_doc = undefined
        if (modal == ROLES.ADMIN) {
            token_doc = await adminService.findById(data.id)
            req["admin"] = token_doc.data
        } else if (modal == ROLES.VEHICLE) {
            token_doc = await vehicleService.findById(data.id)
            req["vehicle"] = token_doc.data
        } else if (modal == ROLES.USER) {
            token_doc = await userService.findById(data.id)
            req["user"] = token_doc.data
        }
        if (!token_doc) {
            return _res.status(401).send({ isSuccess: false, isError: true, isServerError: false, statusCode: 401, message: "Session not found" });
        }
        next()

    } catch (err) {
        return _res.status(401).send({ isSuccess: false, isError: true, isServerError: false, statusCode: 500, message: "Session not found" });
    }
    return response

};