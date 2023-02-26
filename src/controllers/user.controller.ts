import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
import SERVICE_IDENTIFIER from '../../identifiers';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import UserDTO from '../models/dto-models/user.dto';
import IUserService from '../services/interfaces/iuser.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Get, Post, PUT } from '../utils/decorators/handlers.decorator';

function getUserService(): IUserService {
  return resolve<IUserService>(SERVICE_IDENTIFIER.UserService);
}
const userService = getUserService();

@Controller('/users')
export default class UserController {

  @Post('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async createUser(req: Request, res: Response): Promise<void> {
    const body: UserDTO = req.body

    //@ts-ignore
    const files: any = req.files;
    const response = await userService.createUser(body, files);
    res.send(response)
    return
  }


  @Post('/login')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async loginUser(req: Request, res: Response): Promise<void> {
    const body: {
      email: string;
      password: string;
      pushToken: string;
    } = req.body
    const response = await userService.loginUser(body);
    res.send(response)
    return
  }


  @Post('/forget-password')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async forgetPassword(req: Request, res: Response): Promise<void> {
    const body: {
      email: string;
    } = req.body
    const response = await userService.forgetPassword(body.email);
    res.send(response)
    return
  }


  @PUT('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async updateUser(req: Request, res: Response): Promise<void> {
    const body: UserDTO = req.body
    //@ts-ignore
    const files: any = req.files;

    const response = await userService.updateUser(body, files);
    res.send(response)
    return
  }


  @Post('/verify-otp')
  @UseGuard(Auth)
  public async verifyOTP(req: Request, res: Response): Promise<void> {
    const body: {
      otp: string;
      email: string;
    } = req.body

    const response = await userService.verifyOTP(body);
    res.send(response)
    return
  }



  @Get('/')
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery = req.query as unknown as { searchQueryText: string, search: string, type: string, page: number, limit: number };
    const response = await userService.getAll(baseQuery)
    res.send(response)
    return
  }

}
