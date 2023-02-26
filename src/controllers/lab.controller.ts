import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
import SERVICE_IDENTIFIER from '../../identifiers';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import LabDTO from '../models/dto-models/lab.dto';
import LabServiceDTO from '../models/dto-models/lab.subservice.dto';
import UpdateLabDTO from '../models/dto-models/lab.update..dto';
import ILabService from '../services/interfaces/ilab.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getLabService(): ILabService {
  return resolve<ILabService>(SERVICE_IDENTIFIER.LabService)
}
const labService = getLabService();

@Controller('/labs')
export default class LabController {

  @Post('/subservice')
  @Validation(LabServiceDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async createSubservicesForLab(req: Request, res: Response): Promise<void> {
    const body: { lab: string, subServices: any[] } = req.body;
    const response = await labService.createSubservicesForLab(body);
    res.send(response)
    return
  }

  @Post('/')
  @Validation(LabDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async createLab(req: Request, res: Response): Promise<void> {
    const body: LabDTO = req.body as unknown as LabDTO;
    const response = await labService.create(body);
    res.send(response)
    return
  }

  @PUT('/')
  @Validation(UpdateLabDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async updateLab(req: Request, res: Response): Promise<void> {
    const body: UpdateLabDTO = req.body as unknown as UpdateLabDTO;
    const response = await labService.update(body);
    res.send(response)
    return
  }

  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const body: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as string;
    const response = await labService.getAll(body, searchQueryText);
    res.send(response)
    return
  }

  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id;
    const response = await labService.deleteLab({ _id: id })
    res.send(response)
    return
  }

  @PUT('/subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async updateSubService(req: Request, res: Response): Promise<void> {
    const body: {
      lab: string;
      subService: string;
      price: string;
    } = req.body;
    const response = await labService.updateSubService(body)
    res.send(response)
    return
  }


  @Get('/:lab/subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllSubservices(req: Request, res: Response): Promise<void> {
    const body = req.params as { lab: string };
    const response = await labService.getAllSubservices(body);
    res.send(response)
    return
  }
}
