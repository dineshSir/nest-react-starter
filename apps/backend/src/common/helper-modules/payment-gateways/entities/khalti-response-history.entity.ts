import { CommonEntity } from 'src/common/entities/common.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { PaymentStatus } from 'src/modules/payment/enums/payment-status.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class KhaltiPayHistory extends CommonEntity {
  @Column()
  pidx: string;

  @Column()
  total_amount: number;

  @Column({
    nullable: true,
  })
  status: string;

  @Column({
    nullable: true,
  })
  transaction_id: string;

  @Column()
  fee: number;

  @Column()
  refunded: boolean;
}
