import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class InitiatePaymentDto {
  @Transform(({ value }) => {
    if (typeof value == 'string' && value.trim() == '') return value;
    const number = Number(value);
    return isNaN(number) ? value : number;
  })
  @IsNotEmpty({ message: `Product amount is required.` })
  @IsNumber()
  @Min(10, { message: `Amount can not be less than Rs. 10.` })
  amount: number;

  //add information required about the product user is paying for.
}
