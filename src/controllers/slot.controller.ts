import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
import SERVICE_IDENTIFIER from '../../identifiers';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SlotDTO from '../models/dto-models/slot.dto';
import ISlotService from '../services/interfaces/islot.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Get } from '../utils/decorators/handlers.decorator';

function getSlotService(): ISlotService {
  return resolve<ISlotService>(SERVICE_IDENTIFIER.SlotService)
}
const slotService = getSlotService();

@Controller('/slots')
export default class SlotController {


  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const body: SlotDTO = req.query as unknown as SlotDTO;
    const response = await slotService.getAll(body);
    res.send(response)
    return
  }


  @Get('/subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const response = await slotService.getAllSlotsMultipleTest()
    res.send(response)
    return
  }


  @Get('/calender')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllSubservices(req: Request, res: Response): Promise<void> {
    const body = req.query as { type: any, date: any, vendor: any, search: any, shift: any, startTime: any, endTime: any };
    const response = await slotService.getCalenderData(body)
    res.send(response)
    return
  }

}
