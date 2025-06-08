import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { KhaltiPayService } from 'src/common/helper-modules/payment-gateways/khalti-pay.service';
import { generatePaymentUUID } from './helper-functions/payment-uuid-generator';
import { Payment } from './entities/payment.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentGateway } from './enums/payment-gateways.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { safeError } from 'src/common/helper-functions/safe-error.helper';
import { runInTransaction } from 'src/common/helper-functions/transaction.helper';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly khaltiPayService: KhaltiPayService,
    private readonly dataSource: DataSource,
  ) {}

  async initiateKhaltiPay(initiatePaymentDto: InitiatePaymentDto) {
    let newPayment: Payment | undefined;
    const paymentRepository = this.dataSource.getRepository(Payment);
    const [result, error] = await safeError(
      runInTransaction(async (queryRunner) => {
        const transactionUuid = generatePaymentUUID();
        const paymentInstance = Object.assign(new Payment(), {
          transactionUuid,
          ...initiatePaymentDto,
          gateway: PaymentGateway.KHALTI,
          status: PaymentStatus.PENDING,
        });

        const payment = queryRunner.manager.create(Payment, paymentInstance);
        newPayment = await queryRunner.manager.save(Payment, payment);

        const khaltiPayInitData = {
          amount: initiatePaymentDto.amount * 100,
          purchase_order_id: transactionUuid,
          purchase_order_name: 'something beautiful',
        };
        return { newPayment, khaltiPayInitData };
      }),
    );
    if (error) {
      console.log(error);
      throw error;
    }

    const [response, _error] = await safeError(
      this.khaltiPayService.initiate(result.khaltiPayInitData),
    );

    if (_error) {
      console.log(_error.message);
      if (_error instanceof BadGatewayException)
        throw new BadGatewayException(_error.message);
      else if (_error instanceof BadRequestException)
        throw new BadRequestException(_error.message);
      else
        throw new InternalServerErrorException(
          `Error while initiating khalti payment.`,
        );
    }

    if (!result.newPayment) {
      throw new InternalServerErrorException('Payment initialization failed.');
    }

    result.newPayment.status = PaymentStatus.INITIATED;
    await paymentRepository.save(result.newPayment);
    return response;
  }

  async verifyKhaltiPay(khaltiTransactionResponse: any) {
    // const {pidx, }
  }
}
