import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true, name: 'first_name' })
  first_name: string;

  @Column({ nullable: true, name: 'last_name' })
  last_name: string;

  @Column({ nullable: true, name: 'address_line1' })
  address_line1: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'int', nullable: true })
  loyalty_points: number;

  @Column({ type: 'date', nullable: true, name: 'last_order_date' })
  last_order_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updated_at: Date;
}