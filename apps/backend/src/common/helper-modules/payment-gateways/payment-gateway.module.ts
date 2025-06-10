import { Global, Module } from '@nestjs/common';
import { KhaltiPayService } from './khalti-pay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhaltiPayHistory } from './entities/khalti-response-history.entity';
import { EsewaService } from './esewa.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KhaltiPayHistory])],
  providers: [KhaltiPayService, EsewaService],
  exports: [KhaltiPayService, EsewaService],
})
export class PaymentGateway {}
