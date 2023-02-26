import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
import SERVICE_IDENTIFIER from '../../identifiers';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import BaseQueryDTO from '../models/dto-models/base.query.dto';
import VehicleDTO from '../models/dto-models/vehicle.dto';
import VendorDTO from '../models/dto-models/vendor.dto';
import IVendorService from '../services/interfaces/ivendor.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { DELETE, Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';

function getVendorService(): IVendorService {
  return resolve<IVendorService>(SERVICE_IDENTIFIER.VendorService)
}
const vendorService = getVendorService();

@Controller('/vendors')
export default class VendorController {


  @Get('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAll(req: Request, res: Response): Promise<void> {
    const body: BaseQueryDTO = req.query as unknown as BaseQueryDTO;
    const searchQueryText: string | undefined = req.query.searchQueryText as string;
    const response = await vendorService.getAll(body, searchQueryText);
    res.send(response)
    return
  }


  @Post('')
  @Validation(VendorDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: VendorDTO = req.body;
    //@ts-ignore
    const files = req.files as any
    const response = await vendorService.create(body, files)
    res.send(response)
    return
  }

  @Post('/subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async createSubservicesForVendor(req: Request, res: Response): Promise<void> {
    const body: { vendor: string, subServices: any[] } = req.body;
    const response = await vendorService.createSubservicesForVendor(body)
    res.send(response)
    return
  }

  @Get('/subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllSubservices(req: Request, res: Response): Promise<void> {
    const body = req.query as { vendor: string };
    const response = await vendorService.getAllSubservices(body.vendor)
    res.send(response)
    return
  }

  @DELETE('/:_id/subservice/:subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async deleteSubService(req: Request, res: Response): Promise<void> {
    const body = req.params as { _id: string, subService: string }
    const response = await vendorService.deleteSubService(body)
    res.send(response)
    return
  }


  @PUT('/')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: VehicleDTO = req.body;
    //@ts-ignore
    const files = req.files as any
    //@ts-ignore
    const response = await vendorService.update(body, files)
    res.send(response)
    return
  }

  @PUT('/subservice')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async updateSubService(req: Request, res: Response): Promise<void> {
    const body: { vendor: any, subService: any, commission: any, commissionValue: any, price: any } = req.body;
    const response = await vendorService.updateSubService(body)
    res.send(response)
    return
  }
}
