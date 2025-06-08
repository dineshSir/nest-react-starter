import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { KhaltiPayInitiateInterface } from 'src/common/interfaces/khalti-payment-initiate.interface';

@Injectable()
export class KhaltiPayService {
  async initiate(khaltiPayInitData: KhaltiPayInitiateInterface) {
    try {
      const response = await axios({
        method: 'post',
        url: `${process.env.KHALTI_INITIATION_URL}`,
        headers: {
          Authorization: `Key ${process.env.KHALTI_LIVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        data: {
          // return_url: process.env.KHALTI_CALLBACK_URL,
          website_url: process.env.WEBSITE_URL,
          ...khaltiPayInitData,
        },
      });
      return response.data;
    } catch (error) {
      const errorIn = Object.keys(error.response.data)[0];
      if (errorIn == 'return_url' || 'website_url') {
        throw new BadGatewayException(`${errorIn} is either invalid or blank.`);
      } else if (errorIn == 'amount') {
        throw new BadRequestException(
          `Amount is either invalid or less than Rs. 10.`,
        );
      } else if (errorIn == 'purchase_order_id' || 'purchase_order_name') {
        throw new BadRequestException(`${errorIn} can not be blank.`);
      }
      throw new InternalServerErrorException();
    }
  }

  async verifyKhaltiPayment(pidx: string) {
    try {
      const response = await axios({
        method: 'post',
        url: `${process.env.KHALTI_VERIFICATION_URL}`,
        headers: {
          Authorization: `Key ${process.env.KHALTI_LIVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        data: { pidx },
      });
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
