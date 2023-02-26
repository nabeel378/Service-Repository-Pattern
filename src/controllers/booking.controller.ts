import { Request, Response } from 'express';
import { resolve } from '../../dependencymanagement';
// import { resolve } from '../dependencymanagement';
import { Auth } from '../guards/auth.guard';
import { checkRole } from '../guards/role.guard';
import SERVICE_IDENTIFIER from '../../identifiers';
import IBookingService from '../services/interfaces/ibooking.service';
import Controller from '../utils/decorators/controller.decorator';
import UseGuard from '../utils/decorators/guard.decorator';
import { Get, Post, PUT } from '../utils/decorators/handlers.decorator';
import Validation from '../utils/decorators/validation.decorator';
import CreateBookingDTO from '../models/dto-models/booking.create.dto';
import AdminDTO from '../models/dto-models/admin.dto';
import CreateConsentDTO from '../models/dto-models/consent.create.dto';
import BookingDTO from '../models/dto-models/booking.dto';
import UpdateBookingDTO from '../models/dto-models/booking.update.dto';
import VehicleDTO from '../models/dto-models/vehicle.dto';
import { STATUS } from '../enums/appointment.enum';
import CreateBookingWalkInDTO from '../models/dto-models/booking.walkin.create.dto';
import { Parser } from 'json2csv';
import DownloadCSVBookingDTO from '../models/dto-models/booking.downloadcsv.dto';

function getBookingService(): IBookingService {
  return resolve<IBookingService>(SERVICE_IDENTIFIER.BookingService);
}
const bookingService = getBookingService();


@Controller('/booking')
export default class BookingController {

  @Post('')
  @Validation(CreateBookingDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async create(req: Request, res: Response): Promise<void> {
    const body: CreateBookingDTO = req.body;

    //@ts-ignore
    const admin = req.admin as AdminDTO
    const response = await bookingService.create(body, admin)
    res.send(response)
    return
  }


  @PUT('/status')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async chnageStatus(req: Request, res: Response): Promise<void> {
    const body = req.body;
    //@ts-ignore
    const admin = req.admin as AdminDTO
    //@ts-ignore
    const vehicle = req.vehicle as VehicleDTO
    const response = await bookingService.changeStatus(body, admin, vehicle)
    res.send(response)
    return
  }


  @Post('/cancel')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async cancelBooking(req: Request, res: Response): Promise<void> {
    const body: {
      _id: any;
      remarks: any;
    } = req.body;
    //@ts-ignore
    const admin = req.admin as AdminDTO
    //@ts-ignore
    const vehicle = req.vehicle as VehicleDTO
    const response = await bookingService.cancelBooking(body, admin, vehicle)
    res.send(response)
    return
  }



  @PUT('')
  @Validation(UpdateBookingDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async update(req: Request, res: Response): Promise<void> {
    const body: BookingDTO = req.body;

    //@ts-ignore
    const admin = req.admin as AdminDTO
    const response = await bookingService.update(body)
    res.send(response)
    return
  }

  @Get('')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllNormal(req: Request, res: Response): Promise<void> {
    const query: any = req.query;
    const response = await bookingService.getAll(query)
    res.send(response);
    return
  }

  @Get('/urgent')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllUrgent(req: Request, res: Response): Promise<void> {
    const query: any = req.query;
    const response = await bookingService.getAll(query, "urgent")
    res.send(response);
    return
  }

  @Post('/consent-form')
  @Validation(CreateConsentDTO)
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async addConsentForm(req: Request, res: Response): Promise<void> {
    const body: any = req.body;
    //@ts-ignore
    const response = await bookingService.consentForm(body, req.files)
    res.send(response);
    return
  }


  @Post('/assign/team')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async assignTeamMember(req: Request, res: Response): Promise<void> {
    const body: any = req.body;
    //@ts-ignore
    const response = await bookingService.assignTeamMember(body, req.files)
    res.send(response);
    return
  }

  @Get('/vehicle')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getBokingsForVehicle(req: Request, res: Response): Promise<void> {
    const body: { status: STATUS[] } = req.body;
    //@ts-ignore
    const vehicle = req.vehicle as VehicleDTO
    const response = await bookingService.getBookingsForVehicle(body, vehicle)
    res.send(response)
    return
  }


  @Get('/unassigned-god-eye')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getAllUnassignedForGodsEye(req: Request, res: Response): Promise<void> {
    const body: { searchQueryText: string } = req.body;
    //@ts-ignore
    const response = await bookingService.getAllUnassignedForGodsEye(body)
    res.send(response)
    return
  }

  @Get('/:id')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async getBookingById(req: Request, res: Response): Promise<void> {
    const body = req.params as { id: string }
    //@ts-ignore
    const response = await bookingService.getBookingById(body.id)
    res.send(response)
    return
  }

  @Post('/walk-in')
  @UseGuard(checkRole("admin"))
  @UseGuard(Auth)
  public async bookingCreateWalkin(req: Request, res: Response): Promise<void> {
    const body: CreateBookingWalkInDTO = req.body;
    //@ts-ignore
    const admin = req.admin as AdminDTO
    //@ts-ignore  
    const files = req.files as any

    const response = await bookingService.bookingCreateWalkin(body, admin, files)
    res.send(response)
    return
  }


  @Post('/remark')
  @UseGuard(Auth)
  public async addRemarks(req: Request, res: Response): Promise<void> {
    const body: {
      _id: string;
      remarks: string;
    } = req.body;
    //@ts-ignore
    const admin = req.admin as AdminDTO
    //@ts-ignore  
    const files = req.files as any

    const response = await bookingService.addRemarks(body, admin, files)
    res.send(response)
    return
  }


  @Post('/download/csv')
  @UseGuard(Auth)
  public async downloadCSV(req: Request, res: Response): Promise<void> {
    const body: DownloadCSVBookingDTO = req.body;
    const response = await bookingService.downloadCsv(body)
    const json2csvParser = new Parser({ excelStrings: true });

    const csv = json2csvParser.parse(response.data!.map((w: { bookingId: any; }, i: any) => {
      return {
        "BOOKING ID": w && w.bookingId && w.bookingId ? (w.bookingId).toUpperCase() : "-",

      }
    }));
    res.set('Content-Type', 'application/octet-stream');
    res.attachment(`appointments${new Date().getTime()}.csv`);
    res.status(200).send(csv);
    return
  }
}
