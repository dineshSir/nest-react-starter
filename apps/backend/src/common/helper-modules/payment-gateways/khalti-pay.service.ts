import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { KhaltiPayInitiateInterface } from 'src/common/interfaces/khalti-payment-initiate.interface';
import dataSource from 'src/database/seeds/seeds';
import { DataSource } from 'typeorm';
import { KhaltiPayHistory } from './entities/khalti-response-history.entity';
import { response } from 'express';

@Injectable()
export class KhaltiPayService {
  constructor(private readonly dataSource: DataSource) {}
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
          return_url: process.env.KHALTI_CALLBACK_URL,
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

      const verifiedData = response.data;
      await this.saveKhaltiResponseHistory(verifiedData);

      return verifiedData;
    } catch (error) {
      if (error.response.data.status == 'User canceled') {
        const verifiedData = error.response.data;
        this.saveKhaltiResponseHistory(verifiedData);
        return verifiedData;
      }

      throw new InternalServerErrorException(
        `Error while verifying khalti transaction.`,
      );
    }
  }

  async saveKhaltiResponseHistory(verifiedData: any) {
    const khaltiPayHistoryRepository =
      this.dataSource.getRepository(KhaltiPayHistory);

    const khaltiPayHistoryInstance =
      khaltiPayHistoryRepository.create(verifiedData);

    try {
      const newKhaltiPayHistory = await khaltiPayHistoryRepository.save(
        khaltiPayHistoryInstance,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Error while saving khalti history.`,
      );
    }
    return;
  }
}
