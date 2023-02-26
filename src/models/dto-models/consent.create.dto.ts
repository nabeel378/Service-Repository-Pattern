import { IsEmail, IsString } from "../../utils/decorators/validation.decorator";
import BaseDTO from "./base.dto";

class CreateConsentDTO extends BaseDTO {
    @IsString()
    bookingId: string | undefined = undefined;
    @IsString()
    password: string | undefined = undefined;
    covidTestCause: string | undefined = undefined;
    flightDate: string | undefined = undefined;
    airlineName: string | undefined = undefined;
    destination: string | undefined = undefined;
    symptoms: string | undefined = undefined;
    travelHistory: string | undefined = undefined;
    @IsString()
    firstName: string | undefined = undefined;
    dob: string | undefined = undefined;
    phone: string | undefined = undefined;
    gender: string | undefined = undefined;
    @IsEmail()
    email: string | undefined = undefined;
    eid: string | undefined = undefined;
    passportNumber: string | undefined = undefined;
    residentOrVisitor: string | undefined = undefined;
    jobDescription: string | undefined = undefined;
    address: string | undefined = undefined;
    companyName: string | undefined = undefined;
    nationality: string | undefined = undefined;
    occupation: string | undefined = undefined;
    area: string | undefined = undefined;
    institute: string | undefined = undefined;
    campName: string | undefined = undefined;
    supervisorName: string | undefined = undefined;
    supervisorNumber: string | undefined = undefined;
    grade: string | undefined = undefined;
    officeAddress: string | undefined = undefined;
    history: string | undefined = undefined;
    paymentType: string | undefined = undefined;
    isNewAppointment: boolean = false
    vtmNumber: string | undefined = undefined;
}

export default CreateConsentDTO;