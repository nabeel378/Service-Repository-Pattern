import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../../identifiers";
import { ResponseModel } from "../../utils/responsemodel";
import UserDTO from "../../models/dto-models/user.dto";
import IUserRepository from "../../repositories/interfaces/iuser.repository";
import IUserService from "../interfaces/iuser.service";
import md5 from "md5";
import { TYPE } from "../../enums/user.enum";
import { ForbiddenError, InternalError, NotFoundError } from "../../errors/app.error";
import { multipartFileUpload } from "../../utils/imageupload";
import INotificationRepository from "../../repositories/interfaces/inotification.repository";
import { ROLES } from "../../enums/defaults.enum";
import jwt from "jsonwebtoken";
const { PASSWORD_RESET_TOKEN_EXPIRY } = process.env;
import { emailInstance } from "../../configs/email";

@injectable()
class UserService implements IUserService {
    constructor(
        @inject(SERVICE_IDENTIFIER.UserRepository)
        private UserRepository: IUserRepository,
        @inject(SERVICE_IDENTIFIER.NotificationRepository)
        private notificationRepository: INotificationRepository,
    ) { }

    async findById(id: string): Promise<ResponseModel<UserDTO>> {
        const response = new ResponseModel<UserDTO>()
        const result = await this.UserRepository.findById(id)
        response.setSuccessAndData(result)
        return response
    }

    async createUser(userDTO: UserDTO, filesObj: any): Promise<ResponseModel<UserDTO>> {
        const response = new ResponseModel<any>();
        let {
            firstName,
            lastName,
            dob,
            phone,
            gender,
            password = "qam_password",
            email,
            eid,
            passportNumber,
            residentOrVisitor,
            jobDescription,
            companyName,
            nationality,
            institute,
            grade,
            campName,
            supervisorName,
            supervisorNumber,
            area,
            occupation,
            // country,
            // city,
            //@ts-ignore
            pushToken,
            addressTwo,
        } = userDTO;
        password = md5(password);
        let userCheck = await this.UserRepository.findOne({
            email,
            type: TYPE.USER,
        })
        if (userCheck) throw new ForbiddenError("User is already registered");

        let query = {
            password,
            dob,
            phone,
            gender,
            type: TYPE.USER,
            residentOrVisitor,
            nationality,
        } as UserDTO;
        if (firstName) query.firstName = firstName;
        if (eid) query.eid = eid;
        if (lastName) query.lastName = lastName;
        if (email) query.email = email.toLowerCase();
        if (passportNumber) query.passportNumber = passportNumber;
        if (jobDescription) query.jobDescription = jobDescription;
        if (companyName) query.companyName = companyName;
        if (grade) query.grade = grade;
        if (campName) query.campName = campName;
        if (supervisorName) query.supervisorName = supervisorName;
        if (supervisorNumber) query.supervisorNumber = supervisorNumber;
        if (area) query.area = area;
        if (occupation) query.occupation = occupation;
        if (institute) query.institute = institute;
        if (addressTwo) query.addressTwo = addressTwo;

        let user = await this.UserRepository.create({ ...query });
        if (filesObj && filesObj.profileImage) {
            let imageUrl = await multipartFileUpload(
                filesObj.profileImage,
                new Date().getTime(),
                user._id
            );
            await this.UserRepository.update({ _id: user._id }, { imageUrl });
        }
        if (filesObj && filesObj.idCardImage) {
            let eidImageUrl = await multipartFileUpload(
                filesObj.idCardImage,
                new Date().getTime(),
                user._id
            );
            await this.UserRepository.update({ _id: user._id }, { eidImageUrl });
        }

        if (pushToken) {
            let notification = await this.notificationRepository.findOne({ token: pushToken })

            if (notification) {
                await this.notificationRepository.update({ token: pushToken }, { user: user._id }) as any;
            } else {
                //@ts-ignores
                await this.notificationRepository.create({ token: pushToken, user: user._id });
            }
        }

        const token = jwt.sign(
            { id: user._id, role: ROLES.USER },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        response.setSuccessAndData({ user, token })
        return response
    };

    async loginUser(loginDTO: { email: string, password: string, pushToken: string }): Promise<ResponseModel<any>> {
        const response = new ResponseModel<any>();
        let { email, password, pushToken } = loginDTO;
        password = md5(password);
        let registerationCheck = await this.UserRepository.findOne({
            email: email,
            type: TYPE.USER,
        })
        if (!registerationCheck) {
            throw new ForbiddenError("User not registered");
        }
        let user = await this.UserRepository.findOne({
            email: email,
            password: password,
            type: TYPE.USER,
        })
        if (!user) {
            throw new ForbiddenError("email or password might be incorrect");
        }

        if (pushToken) {
            let notification = await this.notificationRepository.findOne({ token: pushToken })

            if (notification) {
                await this.notificationRepository.update({ token: pushToken }, { user: user._id });
            } else {
                //@ts-ignore
                await this.notificationRepository.create({ token: pushToken, user: user._id }) as any;
            }
        }

        const token = jwt.sign(
            { id: user._id, role: ROLES.USER },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        response.setSuccessAndData({ user, token })
        return response
    }

    async updateUser(userDTO: UserDTO, fileObj: any): Promise<ResponseModel<UserDTO>> {
        const response = new ResponseModel<UserDTO>();
        let {
            _id,
            firstName,
            lastName,
            dob,
            phone,
            gender,
            email,
            imageUrl,
            passportNumber,
            residentOrVisitor,
            nationality,
            jobDescription,
            companyName,
            eid,
            occupation,
            grade,
            campName,
            supervisorName,
            supervisorNumber,
            area,
            institute,
            addressTwo,

            // country,
        } = userDTO;

        let query = {
            type: TYPE.USER,
            residentOrVisitor,
            nationality,
        } as UserDTO;

        if (firstName) query.firstName = firstName;
        if (lastName) query.lastName = lastName;
        if (email) query.email = email.toLowerCase();
        if (dob) query.dob = dob;
        if (phone) query.phone = phone;
        if (gender) query.gender = gender;
        if (imageUrl) query.imageUrl = imageUrl;
        if (passportNumber) query.passportNumber = passportNumber;
        if (jobDescription) query.jobDescription = jobDescription;
        if (companyName) query.companyName = companyName;
        if (eid) query.eid = eid;
        if (occupation) query.occupation = occupation;
        if (grade) query.grade = grade;
        if (campName) query.campName = campName;
        if (supervisorName) query.supervisorName = supervisorName;
        if (supervisorNumber) query.supervisorNumber = supervisorNumber;
        if (area) query.area = area;
        if (institute) query.institute = institute;
        if (addressTwo) query.addressTwo = addressTwo;

        if (!imageUrl && fileObj && fileObj.profileImage) {
            imageUrl = await multipartFileUpload(
                fileObj.profileImage,
                new Date().getTime(),
                _id
            );
            query.imageUrl = imageUrl;
        }
        if (fileObj && fileObj.idCardImage) {
            let idCardImageUrl = await multipartFileUpload(
                fileObj.idCardImage,
                new Date().getTime(),
                _id
            );
            query.eidImageUrls = idCardImageUrl;
        }
        let user = await this.UserRepository.update({ _id: _id }, { ...query });
        if (!user) {
            throw new InternalError("User not found");
        }

        response.setErrorAndData(user)
        return response
    };

    /**
 *
 * @param {Request} req
 * @param {Response} res
 */
    async forgetPassword(email: string): Promise<ResponseModel<any>> {
        const response = new ResponseModel<any>();

        let userCheck = await this.UserRepository.findOne({
            email: email,
            type: TYPE.USER,
        })
        if (!userCheck) {
            throw new NotFoundError("User is not registered");
        }
        if (!userCheck.email) {
            throw new Error(
                "User Email is not registered. Please contact vaccination center to update your profile."
            );
        }

        let otp = Math.floor(1000 + Math.random() * 9000);
        let forgetPassword = {
            otp: otp,
            //@ts-ignore
            expiresAt: Date.now() + PASSWORD_RESET_TOKEN_EXPIRY,
        };
        await this.UserRepository.update(
            { _id: userCheck._id },
            { $set: { forgetPassword: forgetPassword } }
        );

        let template = this.otpVerifyTemplate(userCheck, otp);

        emailInstance
            .sendMail({
                from: '"QAM Healthcare" <support@beksmedical.services>',
                // to: receivers, // list of receivers
                to: `${userCheck.email}`, // list of receivers
                subject: `One Time Password for user confirmation`, // Subject line
                html: template,
            })
            .then(async () => {
                response.setSuccessAndData({ email: userCheck.email }, "OTP send your email account")
                return response;
            })
        return response
    }

    private otpVerifyTemplate(user: any, otp: number): string {
        let colour = "blue";
        let logoUrl = "./"
        let message = `
    <div style="margin:0;height:100%;background-color:${colour};padding:20px;background-size:contain;">
    <div
        style="height:100%;max-width:620px;margin:0 auto;background-color:white;border-radius:5px;overflow:hidden;padding:10px">

        <div style="padding:20px">

            <img width="300" height="150" style="margin:auto;display:block;object-fit:contain" src=${logoUrl} alt="Logo" class="CToWUd">

        </div>

        <div style="padding:20px 15px">
            <p
                style="color:#000000;margin:0 0 20px 0;font-size:18px;font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;font-weight:600">
             Hello, ${user.firstName} ${user.lastName}
            </p>
            <p
                style="color:#4d4d4d;margin:0 0 30px 0;font-size:16px;line-height:30px;font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif">
                Your OTP code is here. It will expire in 15 minutes from now.
            </p>
            <div style="margin:0 0 30px 0">
            <div  style="display:block;text-align:center;padding:15px;background:${colour};color:#ffffff;text-decoration:none;border-radius:6px;font-size:24px;letter-spacing: 12px;font-weight:600;font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif">
                ${otp}
            </div>
        </div> 

        <p style="color:#4d4d4d;margin:0 0 30px 0;font-size:16px;line-height:30px;font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif">
            If you didn’t ask to reset your password, you can ignore this email.
        </p>

            <p style="color:#4d4d4d;margin:0;font-size:18px;font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif">
                <b>
                    Thank you
                </b>
            </p>
        </div>
    </div>
</div>
`
        return message


    }

    async verifyOTP(verifyDTO: { otp: string, email: string }): Promise<ResponseModel<any>> {
        const response = new ResponseModel<any>();
        let { otp, email } = verifyDTO;

        let userCheck = await this.UserRepository.findOne({
            email: email,
            "forgetPassword.otp": otp,
            type: TYPE.USER,
        })
        if (!userCheck) throw new Error("OTP not verified");

        if (userCheck.forgetPassword.expiresAt < Date.now()) {
            throw new Error("OTP expired");
        }

        const token = jwt.sign(
            { email: userCheck.email },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        response.setSuccessAndData({ token })
        return response;
    };


    async getAll(queryDTO: { searchQueryText: string, search: string, type: string, page: number, limit: number }): Promise<ResponseModel<any>> {
        const response = new ResponseModel<any>();
        let { searchQueryText, page, limit } = queryDTO;
        let skip;
        if (!page) {
            skip = 0;
            limit = 20;
        } else {
            skip = (Number(page) * Number(limit)) - Number(limit);
        }

        let query = {
            type: TYPE.USER,
        } as any;

        if (searchQueryText) {
            query["$text"] = { $search: searchQueryText };
        }

        // let users = await User.find(query, '-password -__v').lean().exec()
        let data = await this.UserRepository.getAllUser(query, page, limit, skip) as any
        [data] = data;

        if (data.metaData.length === 0) {
            data.metaData = {
                totalDocuments: 0,
                page,
                limit,
            };
        } else {
            [data.metaData] = data.metaData;
        }

        response.setSuccessAndData(data)
        return response
    }

}

export default UserService