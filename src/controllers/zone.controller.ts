import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import ZoneDTO from '../models/dto-models/zone.dto';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import IZoneService from '../services/interfaces/izone.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, PATCH, Post } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getZoneService(): IZoneService {
  return resolve<IZoneService>(SERVICE_IDENTIFIER.ZoneService);
}
const zoneService = getZoneService();


@Controller('/zones')
export default class ZoneController {

  @Post('')
  @Validation(ZoneDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: ZoneDTO = req.body;
    const response = await zoneService.create(body)
    res.send(response)
    return
  }


  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as unknown as string
    const response = await zoneService.getAll(baseQuery, searchQueryText)
    res.send(response)
    return
  }

  @PATCH('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: { _id: string, name: string } = req.body;
    const response = await zoneService.update(body)
    res.send(response)
    return
  }

  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id;
    const response = await zoneService.deleteZone(id)
    res.send(response)
    return
  }

}
