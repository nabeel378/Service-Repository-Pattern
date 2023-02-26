import { GENDER, TYPE, RELATION, RESIDENTORVISITOR } from "../../enums/user.enum";
import BaseDTO from "./base.dto";

class UserDTO extends BaseDTO {
    mrNumber: string = "";
    firstName: string = "";
    lastName: string = "";
    dob: string | Date = "";
    phone: string = "";
    gender: GENDER | undefined = undefined;
    password: string | undefined = undefined
    email: string = ""
    imageUrl: string | undefined = undefined
    eid: string | undefined = undefined
    passportNumber: string | undefined = undefined
    type: TYPE | undefined = undefined
    forgetPassword = {} as {
        otp: string
        expiresAt: number
    };
    relation: RELATION | undefined = undefined
    city: string = "";
    country: string = "";
    residentOrVisitor: RESIDENTORVISITOR | undefined = undefined
    jobDescription: string = "";
    companyName: string = "";
    nationality: string = "";
    eidImageUrls: string[] = [];
    occupation: string = ""
    area: string = ""
    institute: string = ""
    campName: string = ""
    supervisorName: string = ""
    supervisorNumber: string = ""
    grade: string = ""
    officeAddress: string = ""
    address: string = ""
    addressTwo: string = ""
    history: string = "";
}

export default UserDTO;