import { Controller, Post, Body, Get, Query, Redirect } from '@nestjs/common';
import { CreateOnlinePaymentDto } from './dto/create-online-payment.dto';
import { KhaltiPayService } from './khalti-pay.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interfce';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import axios from 'axios';

@Auth(AuthType.None)
@Controller('online-payment')
export class OnlinePaymentController {
  constructor(private readonly khaltiPayService: KhaltiPayService) {}

  @Post('/khalti-pay')
  create(@Body() createOnlinePaymentDto: CreateOnlinePaymentDto) {
    return this.khaltiPayService.initiate(createOnlinePaymentDto);
  }

  @Get('/khalti-callback')
  @Redirect('http://localhost:3001/success')
  async khaltiResponse(@Query() khaltiResponse: any) {
    return this.khaltiPayService.khaltiResponse(khaltiResponse);
  }

  // @Get()
  // findAll() {
  //   return this.onlinePaymentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.onlinePaymentService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.onlinePaymentService.remove(+id);
  // }
}
