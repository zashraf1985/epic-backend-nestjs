import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  PATIENT = 'Patient',
  PRACTITIONER = 'Practitioner',
  RELATED_PERSON = 'RelatedPerson',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  fhir_id: string;

  @Column({ type: 'text', nullable: true })
  access_token: string;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: string;

  @Column({ nullable: true })
  dstu2_id: string;

  @Column({ nullable: true })
  scope: string;
}
