import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import BranchDTO from '../models/dto-models/branch.dto';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import IBranchService from '../services/interfaces/ibranch.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, PATCH, Post } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';
import UpdateBDODTO from '../models/dto-models/branch.update.dto';

function getBranchService(): IBranchService {
  return resolve<IBranchService>(SERVICE_IDENTIFIER.BranchService);
}
const branchService = getBranchService();


@Controller('/branch')
export default class BranchController {

  @Post('')
  @Validation(BranchDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: BranchDTO = req.body;
    const response = await branchService.create(body)
    res.send(response)
    return
  }


  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const baseQuery: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as unknown as string
    const response = await branchService.getAll(baseQuery, searchQueryText)
    res.send(response)
    return
  }

  @PATCH('/')
  @Validation(UpdateBDODTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: BranchDTO = req.body;
    const response = await branchService.update(body)
    res.send(response)
    return
  }

  @DELETE('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async delete(req: Request, res: Response): Promise<void> {
    const id:string= req.params.id;
    const response = await branchService.deleteBranch(id)
    res.send(response)
    return
  }

}
