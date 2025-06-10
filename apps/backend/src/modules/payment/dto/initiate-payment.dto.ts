import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';

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

  // @Transform(({ value }) =>
  //   typeof value === 'string' ? value.trim().toLowerCase() : value,
  // )
  // @IsString({ message: 'Product code must be a string.' })
  // @IsNotEmpty({ message: 'Title is required' })
  // @Length(2, 30, {
  //   message: `Product code length should be greater than 2 and smaller than 30.`,
  // })
  // productCode: string;

  //add information required about the product user is paying for.
}
