import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
import SERVICE_IDENTIFIER from '../../identifiers';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import VehicleDTO from '../models/dto-models/vehicle.dto';
import VehicleLoginDTO from '../models/dto-models/vehicle.login.dto';
import IVehicleService from '../services/interfaces/ivehicle.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getVehicleService(): IVehicleService {
  return resolve<IVehicleService>(SERVICE_IDENTIFIER.VehicleService)
}
const vehicleService = getVehicleService();

@Controller('/vehicles')
export default class VehicleController {


  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const body: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as string;
    const response = await vehicleService.getAll(body, searchQueryText);
    res.send(response)
    return
  }


  @Post('/login')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async login(req: Request, res: Response): Promise<void> {
    const body: VehicleLoginDTO = req.body;
    const response = await vehicleService.login(body)
    res.send(response)
    return
  }


  @Post('/availability')
  @UseGuard(checkRole("vehicle"))
  @UseGuard(Auth)
  public async setAvailibility(req: Request, res: Response): Promise<void> {
    const isAvailable: boolean = req.body.isAvailable;
    //@ts-ignore
    const vehicle = req.vehicle as VehicleDTO
    const response = await vehicleService.setAvailibility(isAvailable, vehicle)
    res.send(response)
    return
  }

  @Post('/get')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async get(req: Request, res: Response): Promise<void> {
    //@ts-ignore
    const vehicle = req.vehicle as VehicleDTO
    const response = await vehicleService.get(vehicle)
    res.send(response)
    return
  }

  @Post('')
  @Validation(VehicleDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: VehicleDTO = req.body;
    const response = await vehicleService.create(body)
    res.send(response)
    return
  }

  @PUT('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: VehicleDTO = req.body;
    const response = await vehicleService.update(body)
    res.send(response)
    return
  }

  @DELETE('/:_id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async deleteVehicle(req: Request, res: Response): Promise<void> {
    const body: { _id: string } = req.params as { _id: string };
    const response = await vehicleService.deleteVehicle(body)
    res.send(response)
    return
  }
}
