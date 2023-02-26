
class MasterDTO {
  vat: number = 0;
  totalRiderDue: number = 0; // Riders se itna paise lena baaqi hai
  totalRiderReceived: number = 0;// Riders se ab tk total itna paisa le chuke hain
  totalVendorEarned: number = 0;// Vendors se kitna kamaya hai aj tk paid unpaid duno
  totalVendorReceived: number = 0;// Vendors se kitna paise receive ho gya hai aj 
  totalBankEarned: number = 0;// Bank se kitna kamaya hai aj tk paid unpaid duno
  totalBankReceived: number = 0;// Bank se kitna paise receive ho gya hai aj tk
  totalCommissionEarned: number = 0;// kitna comission aj tak sab vendors ne kamaya
  totalCommissionPaid: number = 0;// kitna commission aj tak sabs vendors ko mil gya qam se
  totalLabPaid: number = 0;// kitna lab ko paisa dya
  administrationNumber: string = '+971 4355 6643'
  totalQamRevinue!: string | number;
  mrNumberCount: number = 0
}

export default MasterDTO;