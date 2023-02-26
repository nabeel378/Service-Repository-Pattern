import AdminController from './admin.controller';
import AppointmentController from './appointment.controller';
import BdoController from './bdo.controller';
import BookingController from './booking.controller';
import FinanceController from './finance.controller';
import LabController from './lab.controller';
import RegionController from './region.controller';
import SlotController from './slot.controller';
import staffMemberController from './staff-member.controller';
import SubServiceController from './subservice.controller';
import UserController from './user.controller';
import VehicleController from './vehicle.controller';
import VendorController from './vendor.controller';
import ZoneController from './zone.controller';

export const controllers = [
  UserController,
  AdminController,
  BdoController,
  BookingController,
  AppointmentController,
  LabController,
  VehicleController,
  ZoneController,
  RegionController,
  staffMemberController,
  SubServiceController,
  SlotController,
  VendorController,
  FinanceController
];
