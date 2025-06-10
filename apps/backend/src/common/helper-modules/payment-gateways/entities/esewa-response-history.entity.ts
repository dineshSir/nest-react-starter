import { CommonEntity } from 'src/common/entities/common.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class EsewaPaymentHistory extends CommonEntity {
  @Column()
  product_code: string;

  @Column()
  transaction_uuid: number;

  @Column()
  total_amount: number;

  @Column()
  status: string;

  @Column()
  ref_id: string;
}
