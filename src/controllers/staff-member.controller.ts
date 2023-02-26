import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import staffMemberDTO from '../models/dto-models/staff-member.dto';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import IstaffMemberService from '../services/interfaces/istaff-member.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import StaffMemberDTO from '../models/dto-models/staff-member.dto';
import Validation from '../utils/decorators/validation.decorator';
import UpdateStaffMemberDTO from '../models/dto-models/staff-member.update.dto';

function getstaffMemberService(): IstaffMemberService {
  return resolve<IstaffMemberService>(SERVICE_IDENTIFIER.StaffMemberService);
}
const staffMemberService = getstaffMemberService();


@Controller('/staffmembers')
export default class staffMemberController {




  @Post('')
  @Validation(StaffMemberDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: staffMemberDTO = req.body;
    const response = await staffMemberService.create(body)
    res.send(response)
    return
  }

  
  @PUT('/')
  @Validation(UpdateStaffMemberDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: StaffMemberDTO = req.body;
    const response = await staffMemberService.update(body)
    res.send(response)
    return
  }
  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as unknown as string
    const staffGroup: string | undefined = req.query.staffGroup as unknown as string
    const response = await staffMemberService.getAll(baseQuery, { searchQueryText, staffGroup })
    res.send(response)
    return
  }

  
  @Get('/vehicle')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllStaffForVehicle(_req: Request, res: Response): Promise<void> {
    const response = await staffMemberService.getAllStaffForVehicle()
    res.send(response)
    return
  }


  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id;
    const response = await staffMemberService.deleteStaff(id)
    res.send(response)
    return
  }

}
