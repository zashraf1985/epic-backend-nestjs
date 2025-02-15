
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column()
    fhir_id: string

    @Column({ type: 'text', nullable: true })
    access_token: string

    @Column({ nullable: true })
    expires_at: Date

    @Column({ nullable: true })
    user_type: string

    @Column({ nullable: true })
    dstu2_id: string
}
