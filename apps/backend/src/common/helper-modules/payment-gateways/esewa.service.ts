import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EsewaPaymentInitiateInterface } from 'src/common/interfaces/payment-initiate.interface';

@Injectable()
export class EsewaService {
  constructor(private readonly configService: ConfigService) {}
  async getEsewaInitiationSignature(
    esewaInitData: EsewaPaymentInitiateInterface,
  ) {
    const { total_amount, transaction_uuid, product_code } = esewaInitData;
    const signatureInput = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = await this.generateEsewaSignature(signatureInput);
  }

  async generateEsewaSignature(signatureInput: string) {
    try {
      const esewaSecretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q ';
      const hash = CryptoJS.HmacSHA256(signatureInput, esewaSecretKey);
      const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
      return hashInBase64;
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not initiate esewa payment: error while generating esewa signature.',
      );
    }
  }

  async verifyEsewaPayment(esewaTransactionResponse: string) {
    try {
      const decodedResponse = atob(esewaTransactionResponse);
      const decodedData = await JSON.parse(decodedResponse);

      const message = decodedData.signed_field_names
        .split(',')
        .map((signedName: string) => {
          let value = decodedData[signedName];
          if (signedName === 'total_amount' && typeof value === 'string') {
            value = value.replace(/,/g, '');
          }
          return `${signedName}=${value}`;
        })
        .join(',');
      const signature = this.generateEsewaSignature(message);
      if (signature !== decodedData.signature) throw new ConflictException();

      const [decodedTotalAmount, decodedProductCode, decodedTransactionUUID] = [
        typeof decodedData.total_amount === 'string'
          ? decodedData.total_amount.replace(/,/g, '')
          : decodedData.total_amount,
        decodedData.product_code,
        decodedData.transaction_uuid,
      ];

      const response = await axios({
        method: 'GET',
        url: `${process.env.ESEWA_VERIFICATION_URL}?product_code=${decodedProductCode}&total_amount=${decodedTotalAmount}&transaction_uuid=${decodedTransactionUUID}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {}

    // async verifyEsewaPayment(data) {
    //   try {
    //     const decodedString = atob(data);
    //     const decodedData = await JSON.parse(decodedString);
    //     if (decodedData.status !== 'COMPLETE') {
    //       throw new BadRequestException('Payment not completed');
    //     }
    //     const message = decodedData.signed_field_names
    //       .split(',')
    //       .map((v: string) => {
    //         let value = decodedData[v];
    //         // Remove commas from total_amount
    //         if (v === 'total_amount' && typeof value === 'string') {
    //           value = value.replace(/,/g, '');
    //         }
    //         return `${v}=${value}`;
    //       })
    //       .join(',');
    //     // const  = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount}),transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.ESEWA_SERVICE_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;
    //     const signature = generateEsewaSignature(message);
    //     if (signature !== decodedData.signature) {
    //       throw new UnauthorizedException('Invalid Signature');
    //     }
    //     let headersList = {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json',
    //     };
    //     const decodedTotalAmount =
    //       typeof decodedData.total_amount === 'string'
    //         ? decodedData.total_amount.replace(/,/g, '')
    //         : decodedData.total_amount;
    //     let requestOptions = {
    //       url: `${process.env.ESEWA_VERIFICATION_URL}/?product_code=${process.env.ESEWA_SERVICE_PRODUCT_CODE}&total_amount=${decodedTotalAmount}&transaction_uuid=${decodedData.transaction_uuid}`,
    //       method: 'GET',
    //       headers: headersList,
    //     };
    //     const response = await axios.request(requestOptions);
    //     if (
    //       response.data.status !== 'COMPLETE' ||
    //       response.data.transaction_uuid !== decodedData.transaction_uuid ||
    //       Number(response.data.total_amount) !== Number(decodedTotalAmount)
    //     ) {
    //       throw new BadRequestException('Invalid Transaction');
    //     }
    //     return {
    //       decodedData: decodedData,
    //       verificationResponse: response.data,
    //     };
    //   } catch (error) {
    //     throw new InternalServerErrorException(
    //       error?.message || 'Payment Verification Failed',
    //     );
    //   }
    // }
  }

  //save esawa history
}
