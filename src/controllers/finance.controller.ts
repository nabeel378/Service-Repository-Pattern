import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import FinanceDTO from '../models/dto-models/finance.dto';
import IFinanceService from '../services/interfaces/ifinance.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Get } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getFinanceService(): IFinanceService {
  return resolve<IFinanceService>(SERVICE_IDENTIFIER.FinanceService);
}
const financeService = getFinanceService();


@Controller('/finances')
export default class FinanceController {

  @Get('')
  @Validation(FinanceDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const body = req.query as unknown as {page: number, limit:number,type: string,startDate: string,endDate:string,admin:string, lab:string, vendor:string, bdo:string, vehicle:string};
    const response = await financeService.getAll(body)
    res.send(response)
    return
  }  
}
