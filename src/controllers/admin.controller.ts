import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import CreateAdminDTO from '../models/dto-models/admin.create.dto';
import AdminDTO from '../models/dto-models/admin.dto';
import AdminLoginDTO from '../models/dto-models/admin.login.dto';
import UpdateAdminDTO from '../models/dto-models/admin.update.dto';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import IAdminService from '../services/interfaces/iadmin.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Get, PATCH, Post } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getAdminService(): IAdminService {
  return resolve<IAdminService>(SERVICE_IDENTIFIER.AdminService);
}
const adminService = getAdminService();


@Controller('/admin')
export default class AdminController {

  @Post('')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  @Validation(CreateAdminDTO)
  public async create(req: Request, res: Response): Promise<void> {
    const body: CreateAdminDTO = req.body;
    const response = await adminService.create(body)
    res.send(response)
    return
  }

  @Post('/login')
  @Validation(AdminLoginDTO)
  public async login(req: Request, res: Response): Promise<void> {
    const body: AdminLoginDTO = req.body;
    const response = await adminService.login(body)
    res.send(response)
    return
  }

  @Post('/verify-otp')
  public async VerifyLoginOTPCode(req: Request, res: Response): Promise<void> {
    const response = await adminService.VerifyLoginOTPCode({
      _id: req.body._id,
      token: req.body.token,
    })
    res.send(response)
    return
  }

  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as unknown as string
    const response = await adminService.getAll(baseQuery, searchQueryText)
    res.send(response)
    return
  }

  @PATCH('/')
  @Validation(UpdateAdminDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: AdminDTO = req.body;
    const response = await adminService.update(body)
    res.send(response)
    return
  }

}
