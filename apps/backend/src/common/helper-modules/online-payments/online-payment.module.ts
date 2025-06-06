import { Global, Module } from '@nestjs/common';
import { OnlinePaymentController } from './online-payment.controller';
import { KhaltiPayService } from './khalti-pay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPayment } from './entities/online-payment-history.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserPayment])],
  controllers: [OnlinePaymentController],
  providers: [KhaltiPayService],
  exports: [KhaltiPayService],
})
export class OnlinePaymentModule {}
