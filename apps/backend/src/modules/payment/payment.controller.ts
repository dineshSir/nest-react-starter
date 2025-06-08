import { Controller, Post, Body, Get, Query, Redirect } from '@nestjs/common';
import { KhaltiPayService } from '../../common/helper-modules/payment-gateways/khalti-pay.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentService } from './payment.service';

@Auth(AuthType.None)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/khalti-pay')
  initiateKhaltiPay(@Body() initiatePaymentDto: InitiatePaymentDto) {
    return this.paymentService.initiateKhaltiPay(initiatePaymentDto);
  }

  @Get('/khalti-callback')
  @Redirect('http://localhost:3001/success')
  async verifyKhaltiPayment(@Query() khaltiTransactionResponse: any) {
    console.log(khaltiTransactionResponse);
    return this.paymentService.verifyKhaltiPay(khaltiTransactionResponse);
  }

  // @Get()
  // findAll() {
  //   return this.onlinePaymentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.onlinePaymentService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.onlinePaymentService.remove(+id);
  // }
}
