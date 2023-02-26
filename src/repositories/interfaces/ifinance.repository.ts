import FinanceDTO from "../../models/dto-models/finance.dto";
import FinanceToggleDTO from "../../models/dto-models/finance.toggle.dto";
import IRepository from "./irepository";

/**
 * Checkin Interface
 */
export default interface IFinanceRepository extends IRepository<FinanceDTO> {
    getAllFinance(_id: string, dayStartTime: any, dayEndTime: any): Promise<FinanceToggleDTO>

    getSalesByDate(startDate: string | number | Date, endDate: string | number | Date, zone: string | null | undefined): Promise<any>

    getHomeSampleData(query: any, page: any, limit: any, skip: any): Promise<any>

    getWalkInData(query: any, page: any, limit: any, skip: any): Promise<any>

    getHomeSampleRev(query: any, page: any, limit: any, skip: any): Promise<any>

    getVendorPayment(query: any, page: any, limit: any, skip: any): Promise<any>

    getBankPayment(query: any, page: any, limit: any, skip: any): Promise<any>

    getVehiclePaymentData(query: any, page: any, limit: any, skip: any): Promise<any>

    getDepositePayments(query: any, page: any, limit: any, skip: any): Promise<any>

    getAdminPayments(query: any, page: any, limit: any, skip: any): Promise<any>

    getLabPayments(query: any, page: any, limit: any, skip: any): Promise<any>

    getCommissionPayment(query: any, page: any, limit: any, skip: any): Promise<any>
}