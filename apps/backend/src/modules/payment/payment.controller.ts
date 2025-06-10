import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentService } from './payment.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async getEsewaInitiationData(@Body() initiatePaymentDto: InitiatePaymentDto) {
    return this.paymentService.getEsewaInitiationData(initiatePaymentDto);
  }

  @Get('/esewa-callback')
  async verify(@Query('data') esewaTransactionResponse: string) {
    console.log(esewaTransactionResponse);
    return 'hello';
  }

  // @Post('/khalti-pay')
  // initiateKhaltiPay(@Body() initiatePaymentDto: InitiatePaymentDto) {
  //   return this.paymentService.initiateKhaltiPay(initiatePaymentDto);
  // }

  // @Get('/khalti-callback')
  // async verifyKhaltiPayment(@Query() khaltiTransactionResponse: any) {
  //   const result = await this.paymentService.verifyKhaltiPay(
  //     khaltiTransactionResponse,
  //   );

  //   let redirectUrl = 'http://localhost:3001/payment/success';

  //   switch (result.status) {
  //     case 'Pending':
  //       redirectUrl = 'http://localhost:3001/payment/pending';
  //       break;
  //     case 'Initiated':
  //       redirectUrl = 'http://localhost:3001/payment/initiated';
  //       break;
  //     case 'Refunded':
  //       redirectUrl = 'http://localhost:3001/payment/refunded';
  //       break;
  //     case 'Expired':
  //       redirectUrl = 'http://localhost:3001/payment/expired';
  //       break;
  //     case 'User canceled':
  //       redirectUrl = 'http://localhost:3001/payment/cancelled';
  //       break;
  //     default:
  //       redirectUrl = 'http://localhost:3001/payment/success';
  //       break;
  //   }

  //   return { url: redirectUrl, statusCode: 302 };
  // }
}
