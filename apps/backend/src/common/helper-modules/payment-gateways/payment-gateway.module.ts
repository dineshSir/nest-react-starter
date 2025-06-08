import { Global, Module } from '@nestjs/common';
import { KhaltiPayService } from './khalti-pay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhaltiPayHistory } from './entities/khalti-response-history.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KhaltiPayHistory])],
  providers: [KhaltiPayService],
  exports: [KhaltiPayService],
})
export class PaymentGateway {}
