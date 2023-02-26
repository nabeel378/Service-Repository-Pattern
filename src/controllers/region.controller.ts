import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import RegionDTO from '../models/dto-models/region.dto';
import IRegionService from '../services/interfaces/iregion.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, PATCH, Post } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getRegionService(): IRegionService {
  return resolve<IRegionService>(SERVICE_IDENTIFIER.RegionService);
}
const regionService = getRegionService();


@Controller('/regions')
export default class RegionController {

  @Post('')
  @Validation(RegionDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: RegionDTO = req.body;
    const response = await regionService.create(body)
    res.send(response)
    return
  }


  @Get('/without-zone')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllWithoutZone(req: Request, res: Response): Promise<void> {
    const response = await regionService.getAllWithoutZone();
    res.send(response)
    return
  }
  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const response = await regionService.getAll()
    res.send(response)
    return
  }

  @PATCH('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: RegionDTO = req.body;
    const response = await regionService.update(body)
    res.send(response)
    return
  }

  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id;
    const response = await regionService.deleteRegion(id)
    res.send(response)
    return
  }

}
