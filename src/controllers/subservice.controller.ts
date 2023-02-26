import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import SubServiceDTO from '../models/dto-models/subService.dto';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import ISubServiceService from '../services/interfaces/isubService.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import StaffMemberDTO from '../models/dto-models/subService.dto';
import Validation from '../utils/decorators/validation.decorator';
import SubServiceUpdateDTO from '../models/dto-models/subservice.update.dto';

function getSubServiceService(): ISubServiceService {
  return resolve<ISubServiceService>(SERVICE_IDENTIFIER.SubServiceService);
}
const SubServiceService = getSubServiceService();


@Controller('/subservices')
export default class SubServiceController {

  @Post('')
  @Validation(SubServiceDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: SubServiceDTO = req.body;
    const response = await SubServiceService.create(body)
    res.send(response)
    return
  }


  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const body = req.query as { service: string, searchQueryText: string }
    const response = await SubServiceService.getAll(baseQuery, body)
    res.send(response)
    return
  }

  

  @PUT('/')
  @Validation(SubServiceUpdateDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: StaffMemberDTO = req.body;
    const response = await SubServiceService.update(body)
    res.send(response)
    return
  }

  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id;
    const response = await SubServiceService.deleteSubService(id)
    res.send(response)
    return
  }

}
