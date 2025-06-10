import { Injectable } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { Payment } from './entities/payment.entity';
import { DataSource } from 'typeorm';
import { safeError } from 'src/common/helper-functions/safe-error.helper';
import { runInTransaction } from 'src/common/helper-functions/transaction.helper';
import { PaymentGateway } from './enums/payment-gateway.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { generatePaymentUUID } from './helper-functions/generate-payment-uuid';
import { EsewaService } from 'src/common/helper-modules/payment-gateways/esewa.service';
import { EsewaPaymentInitiateInterface } from 'src/common/interfaces/payment-initiate.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly esewaService: EsewaService,
    private readonly configService: ConfigService,
  ) {}
  async getEsewaInitiationData(initiatePaymentDto: InitiatePaymentDto) {
    const { amount } = initiatePaymentDto;
    let newPayment: Payment | undefined;
    const paymentRepository = this.dataSource.getRepository(Payment);
    const [result, error] = await safeError(
      runInTransaction(async (queryRunner) => {
        const transactionUuid = generatePaymentUUID();
        const paymentInstance = Object.assign(new Payment(), {
          transactionUuid,
          ...initiatePaymentDto,
          gateway: PaymentGateway.ESEWA,
          status: PaymentStatus.PENDING,
        });

        const payment = queryRunner.manager.create(Payment, paymentInstance);
        newPayment = await queryRunner.manager.save(Payment, payment);

        const totalAmount = amount; //this total amount should be calculated differently when tax amount, service charge, and other charges are available

        const signatureData: EsewaPaymentInitiateInterface = {
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: 'something', //this should be available from the frontend, should be adjusted accordingly
        };
        const esewaInitiationSignature =
          await this.esewaService.getEsewaInitiationSignature(signatureData);

        const esewaFormData = {
          amount: amount,
          tax_amount: 0,
          product_service_charge: 0,
          product_delivery_charge: 0,
          product_code: 'product_code',
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          success_url: this.configService.get('ESEWA_SUCCESS_URL'),
          failure_url: this.configService.get('ESEWA_FAILURE_URL'),
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: esewaInitiationSignature,
        };

        newPayment.status = PaymentStatus.INITIATED;
        const updatedNewPayment = paymentRepository.manager.save(
          Payment,
          newPayment,
        );

        return esewaFormData;
      }),
    );
    if (error) {
      throw error;
    }
  }

  async verifyEsewaPayment(esewaTransactionResponse: string) {
    const result = this.esewaService.verifyEsewaPayment(
      esewaTransactionResponse,
    );
  }
}
