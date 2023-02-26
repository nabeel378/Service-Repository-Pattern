import BaseDTO from "./base.dto";

class BranchDTO extends BaseDTO {
    name: string = ""
    branchCode: string = ""
    openingTime!: Date;
    closingTime!: Date;
    address: string = ""
    isAvailable!: boolean;
    zipCode!: string;
    phone!: string;
    testOffered!: [];
    city: any
    isHidden: boolean = false
}

export default BranchDTO;