import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { KhaltiPayService } from 'src/common/helper-modules/payment-gateways/khalti-pay.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly esewaService: EsewaService,
    private readonly configService: ConfigService,
    private readonly khaltiPayService: KhaltiPayService,
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
    try {
      const verifiedData = await this.esewaService.verifyEsewaPayment(
        esewaTransactionResponse,
      );

      const paymentRepository = this.dataSource.getRepository(Payment);
      const existingPayment = await paymentRepository.findOne({
        where: { transactionUuid: verifiedData.transaction_uuid },
      });

      if (!existingPayment)
        throw new NotFoundException(
          `Payment not found - has not been initiated.`,
        );

      const statusValue =
        PaymentStatus[verifiedData.status as keyof typeof PaymentStatus];
      existingPayment.status = statusValue;

      const updatedPayment = await paymentRepository.save(existingPayment);
      return verifiedData.status;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while updating payment after esewa verification.`,
      );
    }
  }

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
      throw error;
    }

    const [response, _error] = await safeError(
      this.khaltiPayService.initiate(result.khaltiPayInitData),
    );

    if (_error) {
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
    let { pidx, transaction_id, total_amount, status, refunded } =
      khaltiTransactionResponse;
    transaction_id = transaction_id === '' ? null : transaction_id;
    const verificationResponse =
      await this.khaltiPayService.verifyKhaltiPayment(pidx);
    const {
      pidx: v_pidx,
      total_amount: v_total_amount,
      status: v_status,
      transaction_id: v_transaction_id,
      refunded: v_refunded,
    } = verificationResponse;

    if (
      pidx !== v_pidx ||
      transaction_id !== v_transaction_id ||
      +total_amount !== v_total_amount
    )
      throw new ConflictException(
        `Incomming informations and verification information from khalti mismatch.`,
      );

    return {
      status: v_status,
    };
  }
}
