import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import BranchDTO from '../models/dto-models/branch.dto';
import IBranchService from '../services/interfaces/ibranch.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Post } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

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
}
