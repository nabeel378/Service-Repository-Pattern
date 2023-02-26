import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import BdoDTO from '../models/dto-models/bdo.dto';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import IBdoService from '../services/interfaces/ibdo.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, PATCH, Post } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';
import UpdateBDODTO from '../models/dto-models/bdo.update.dto';
import { ROLES } from '../enums/defaults.enum';

function getBdoService(): IBdoService {
  return resolve<IBdoService>(SERVICE_IDENTIFIER.BdoService);
}
const bdoService = getBdoService();


@Controller('/bdo')
export default class BdoController {

  @Post('')
  @Validation(BdoDTO)
  @UseGuard(checkRole(ROLES.ADMIN))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: BdoDTO = req.body;
    const response = await bdoService.create(body)
    res.send(response)
    return
  }


  @Get('/')
  @UseGuard(checkRole([ROLES.USER,ROLES.ADMIN]))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as unknown as string
    const response = await bdoService.getAll(baseQuery, searchQueryText)
    res.send(response)
    return
  }

  @PATCH('/')
  @Validation(UpdateBDODTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: BdoDTO = req.body;
    const response = await bdoService.update(body)
    res.send(response)
    return
  }

  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id:string= req.params.id;
    const response = await bdoService.deleteBdo(id)
    res.send(response)
    return
  }

}
