import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOnlinePaymentDto } from './dto/create-online-payment.dto';
import { generatePaymentUUID } from './helper-functions/transaction-uuid-generator';
import { UserPayment } from './entities/online-payment-history.entity';
import { safeError } from 'src/common/helper-functions/safe-error.helper';
import { runInTransaction } from 'src/common/helper-functions/transaction.helper';
import { PaymentGateway } from './enums/payment-gateways.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import axios from 'axios';

@Injectable()
export class KhaltiPayService {
  async initiate(createOnlinePaymentDto: CreateOnlinePaymentDto) {
    const [response, error] = await safeError(
      runInTransaction(async (queryRunner) => {
        const transactionUuid = generatePaymentUUID();
        const userPaymentInstance = Object.assign(new UserPayment(), {
          transactionUuid,
          ...createOnlinePaymentDto,
          gateway: PaymentGateway.KHALTI,
          status: PaymentStatus.PENDING,
        });

        const userPayment = queryRunner.manager.create(
          UserPayment,
          userPaymentInstance,
        );
        const newUserPayment = await queryRunner.manager.save(
          UserPayment,
          userPayment,
        );

        const khaltiPayInitData = {
          amount: createOnlinePaymentDto.amount * 100,
          purchase_order_id: transactionUuid,
          purchase_order_name: 'oranges',
        };

        const response = await axios({
          method: 'post',
          url: `${process.env.KHALTI_GATEWAY_URL}/epayment/initiate/`,
          headers: {
            Authorization: `Key ${process.env.KHALTI_LIVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          data: {
            return_url: process.env.KHALTI_RETURN_URL,
            website_url: process.env.WEBSITE_URL,
            ...khaltiPayInitData,
          },
        });
        return response.data;
      }),
    );
    if (error) {
      throw error;
    }
    console.log(response);
    return response;
  }

  async khaltiResponse(khaltiResponse: any) {
    try {
      const verificationResponse = await this.verifyKhaltiPayment(
        khaltiResponse.pidx,
      );
      if (verificationResponse.status == 'Completed')
        return { message: `Payment Succesful` };
    } catch (error) {
      throw error;
    }
  }

  async verifyKhaltiPayment(pidx: string) {
    try {
      const response = await axios({
        method: 'post',
        url: `${process.env.KHALTI_GATEWAY_URL}/epayment/lookup/`,
        headers: {
          Authorization: `Key ${process.env.KHALTI_LIVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        data: { pidx },
      });
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(`Payment verification failed.`);
    }
  }
}
