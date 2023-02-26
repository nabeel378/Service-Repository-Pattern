import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import IAppointmentService from '../services/interfaces/iappointment.service';
import VehicleDTO from '../models/dto-models/vehicle.dto';

function getAppointmentService(): IAppointmentService {
  return resolve<IAppointmentService>(SERVICE_IDENTIFIER.AppointmentService);
}
const appointmentService = getAppointmentService();


@Controller('/appointments')
export default class AppointmentController {

  
  @Get("/summary")
  @UseGuard(Auth)
  public async appointmentsSummary(req: Request, res: Response): Promise<void> {
    const body = req.body as unknown as {
      date: string | Date;
    }
    const response = await appointmentService.appointmentsSummary(body)
    res.send(response)
    return
  }

  @PUT('/sub-service')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: { _id: string, subService: string[], vendor: string } = req.body;
    const response = await appointmentService.subServiceUpdateForAppointmentMutipleTest(body)
    res.send(response)
    return
  }

  
  @Post('/vtm')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async updateVTMandLabMultipleTest(req: Request, res: Response): Promise<void> {
    const body: { _id: string, subService: any[], lab: string } = req.body;
    //@ts-ignore
    const files = req.files as any
    const response = await appointmentService.updateVTMandLabMultipleTest(body,files)
    res.send(response)
    return
  }
  


  @Get("/:_id")
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getSingleAppointment(req: Request, res: Response): Promise<void> {
    const { _id } = req.params as unknown as { _id: string }
    const response = await appointmentService.getSingleAppointment(_id)
    res.send(response)
    return
  }


  @Post("/cancel")
  @UseGuard(Auth)
  public async cancelAppointment(req: Request, res: Response): Promise<void> {
    const body = req.body as unknown as { _id: string }
    //@ts-ignore
    const admin = req.admin as AdminDTO
    //@ts-ignore
    const vehicle = req.vehicle as VehicleDTO

    const response = await appointmentService.cancelAppointment(body, vehicle, admin)
    res.send(response)
    return
  }


  @Post("/revert-cancel")
  @UseGuard(Auth)
  public async revertCancelAppointment(req: Request, res: Response): Promise<void> {
    const body = req.body as unknown as { _id: string }
    const response = await appointmentService.revertBackCancellation(body)
    res.send(response)
    return
  }




}
