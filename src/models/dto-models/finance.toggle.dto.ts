import mongoose from 'mongoose';

class FinanceToggleDTO {
    doctorPay: {
        _id: mongoose.Schema.Types.ObjectId,
        amount: number,
        time: Date
    }[] = []
    customerPay :any[] = []
    
}

export default FinanceToggleDTO;