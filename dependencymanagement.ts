import "reflect-metadata";
import { Container } from "inversify";
import SERVICE_IDENTIFIER from "./identifiers";
import IAdminRepository from "./src/repositories/interfaces/iadmin.repository";
import AdminRepository from "./src/repositories/implementations/admin.repository";
import AdminService from "./src/services/implementations/admin.service";
import IAdminService from "./src/services/interfaces/iadmin.service";
import IBdoRepository from "./src/repositories/interfaces/ibdo.repository";
import IBdoService from "./src/services/interfaces/ibdo.service";
import BdoService from "./src/services/implementations/bdo.service";
import BdoRepository from "./src/repositories/implementations/bdo.repository";
import CheckinRepository from "./src/repositories/implementations/checkin.repository";
import ICheckinRepository from "./src/repositories/interfaces/icheckin.repository";
import ICheckinService from "./src/services/interfaces/icheckin.service";
import CheckinService from "./src/services/implementations/checkin.service";
import IBookingRepository from "./src/repositories/interfaces/ibooking.repository";
import BookingRepository from "./src/repositories/implementations/booking.repository";
import IBookingService from "./src/services/interfaces/ibooking.service";
import BookingService from "./src/services/implementations/booking.service";
import ISlotRepository from "./src/repositories/interfaces/islot.repository";
import SlotRepository from "./src/repositories/implementations/slot.repository";
import VendorRepository from "./src/repositories/implementations/vendor.repository";
import IVendorRepository from "./src/repositories/interfaces/ivendor.repository";
import MasterRepository from "./src/repositories/implementations/master.repository";
import IMasterRepository from "./src/repositories/interfaces/imaster.repository";
import IAppointmentRepository from "./src/repositories/interfaces/iappointment.repository";
import AppointmentRepository from "./src/repositories/implementations/appointment.repository";
import IAppointmentService from "./src/services/interfaces/iappointment.service";
import AppointmentService from "./src/services/implementations/appointment.service";
import IUserRepository from "./src/repositories/interfaces/iuser.repository";
import UserRepository from "./src/repositories/implementations/user.repository";
import ISubServiceRepository from "./src/repositories/interfaces/isubservice.repository";
import SubServiceRepository from "./src/repositories/implementations/subservice.repository";
import IFinanceRepository from "./src/repositories/interfaces/ifinance.repository";
import FinanceRepository from "./src/repositories/implementations/finance.repository";
import IVehicleRepository from "./src/repositories/interfaces/ivehicle.repository";
import VehicleRepository from "./src/repositories/implementations/vehicle.repository";
import IFinanceService from "./src/services/interfaces/ifinance.service";
import FinanceService from "./src/services/implementations/finance.service";
import IBranchRepository from "./src/repositories/interfaces/ibranch.repository";
import BranchRepository from "./src/repositories/implementations/branch.repository";
import LabRepository from "./src/repositories/implementations/lab.repository";
import ILabRepository from "./src/repositories/interfaces/ilab.repository";
import LabService from "./src/services/implementations/lab.service";
import ILabService from "./src/services/interfaces/ilab.service";
import IVehicleService from "./src/services/interfaces/ivehicle.service";
import VehicleService from "./src/services/implementations/vehicle.service";
import NotificationRepository from "./src/repositories/implementations/notification.repository";
import INotificationRepository from "./src/repositories/interfaces/inotification.repository";
import IZoneRepository from "./src/repositories/interfaces/izone.repository";
import ZoneRepository from "./src/repositories/implementations/zone.repository";
import VendorService from "./src/services/implementations/vendor.service";
import IVendorService from "./src/services/interfaces/ivendor.service";
import ZoneService from "./src/services/implementations/zone.service";
import IZoneService from "./src/services/interfaces/izone.service";
import RegionRepository from "./src/repositories/implementations/region.repository";
import IRegionRepository from "./src/repositories/interfaces/iregion.repository";
import RegionService from "./src/services/implementations/region.service";
import IRegionService from "./src/services/interfaces/iregion.service";
import StaffMemberRepository from "./src/repositories/implementations/staff-member.repository";
import IStaffMemberRepository from "./src/repositories/interfaces/istaff-member.repository";
import StaffMemberService from "./src/services/implementations/staff-member.service";
import IStaffMemberService from "./src/services/interfaces/istaff-member.service";
import SubServiceService from "./src/services/implementations/subservice.service";
import ISubServiceService from "./src/services/interfaces/isubservice.service";
import IServiceRepository from "./src/repositories/interfaces/iservice.repository";
import ServiceRepository from "./src/repositories/implementations/service.repository";
import SlotService from "./src/services/implementations/slot.service";
import ISlotService from "./src/services/interfaces/islot.service";
import IUserService from "./src/services/interfaces/iuser.service";
import UserService from "./src/services/implementations/user.service";
import UnitOfWork from "./src/repositories/implementations/unit-of-work";
import IUnitOfWork from "./src/repositories/interfaces/iunit-of-work";

let container = new Container();


container
  .bind<IAdminRepository>(SERVICE_IDENTIFIER.AdminRepository)
  .to(AdminRepository);

container
  .bind<IAdminService>(SERVICE_IDENTIFIER.AdminService)
  .to(AdminService);
container
  .bind<IBdoRepository>(SERVICE_IDENTIFIER.BdoRepository)
  .to(BdoRepository);

container
  .bind<IBdoService>(SERVICE_IDENTIFIER.BdoService)
  .to(BdoService);
container
  .bind<ICheckinRepository>(SERVICE_IDENTIFIER.CheckinRepository)
  .to(CheckinRepository);

container
  .bind<ICheckinService>(SERVICE_IDENTIFIER.CheckinService)
  .to(CheckinService);
container
  .bind<IBookingRepository>(SERVICE_IDENTIFIER.BookingRepository)
  .to(BookingRepository);
container
  .bind<IBookingService>(SERVICE_IDENTIFIER.BookingService)
  .to(BookingService);
container
  .bind<IUserService>(SERVICE_IDENTIFIER.UserService)
  .to(UserService);
container
  .bind<ISlotService>(SERVICE_IDENTIFIER.SlotService)
  .to(SlotService);
container
  .bind<ISlotRepository>(SERVICE_IDENTIFIER.SlotRepository)
  .to(SlotRepository);
container
  .bind<IVendorRepository>(SERVICE_IDENTIFIER.VendorRepository)
  .to(VendorRepository);
container
  .bind<IVendorService>(SERVICE_IDENTIFIER.VendorService)
  .to(VendorService);
container
  .bind<IZoneService>(SERVICE_IDENTIFIER.ZoneService)
  .to(ZoneService);
container
  .bind<IMasterRepository>(SERVICE_IDENTIFIER.MasterRepository)
  .to(MasterRepository);
container
  .bind<IAppointmentRepository>(SERVICE_IDENTIFIER.AppointmentRepository)
  .to(AppointmentRepository);
container
  .bind<IAppointmentService>(SERVICE_IDENTIFIER.AppointmentService)
  .to(AppointmentService);
container
  .bind<IUserRepository>(SERVICE_IDENTIFIER.UserRepository)
  .to(UserRepository);
container
  .bind<ISubServiceRepository>(SERVICE_IDENTIFIER.SubServiceRepository)
  .to(SubServiceRepository);
container
  .bind<IServiceRepository>(SERVICE_IDENTIFIER.ServiceRepository)
  .to(ServiceRepository);
container
  .bind<IFinanceRepository>(SERVICE_IDENTIFIER.FinanceRepository)
  .to(FinanceRepository);
container
  .bind<IFinanceService>(SERVICE_IDENTIFIER.FinanceService)
  .to(FinanceService);
container
  .bind<IVehicleRepository>(SERVICE_IDENTIFIER.VehicleRepository)
  .to(VehicleRepository);
container
  .bind<IVehicleService>(SERVICE_IDENTIFIER.VehicleService)
  .to(VehicleService);
container
  .bind<IRegionRepository>(SERVICE_IDENTIFIER.RegionRepository)
  .to(RegionRepository);
container
  .bind<IRegionService>(SERVICE_IDENTIFIER.RegionService)
  .to(RegionService);
container
  .bind<IBranchRepository>(SERVICE_IDENTIFIER.BranchRepository)
  .to(BranchRepository);
container
  .bind<INotificationRepository>(SERVICE_IDENTIFIER.NotificationRepository)
  .to(NotificationRepository);
container
  .bind<IZoneRepository>(SERVICE_IDENTIFIER.ZoneRepository)
  .to(ZoneRepository);
container
  .bind<ILabRepository>(SERVICE_IDENTIFIER.LabRepository)
  .to(LabRepository);
container
  .bind<ILabService>(SERVICE_IDENTIFIER.LabService)
  .to(LabService);

container
  .bind<ISubServiceService>(SERVICE_IDENTIFIER.SubServiceService)
  .to(SubServiceService);

container
  .bind<IUnitOfWork>(SERVICE_IDENTIFIER.UnitOfWork)
  .to(UnitOfWork);
container
  .bind<IStaffMemberRepository>(SERVICE_IDENTIFIER.StaffMemberRepository)
  .to(StaffMemberRepository);
container
  .bind<IStaffMemberService>(SERVICE_IDENTIFIER.StaffMemberService)
  .to(StaffMemberService);
function resolve<T>(type: symbol): T {
  return container.get<T>(type);
}

export { resolve }