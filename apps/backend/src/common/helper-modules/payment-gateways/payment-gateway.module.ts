import { Global, Module } from '@nestjs/common';
import { KhaltiPayService } from './khalti-pay.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  providers: [KhaltiPayService],
  exports: [KhaltiPayService],
})
export class PaymentGateway {}
