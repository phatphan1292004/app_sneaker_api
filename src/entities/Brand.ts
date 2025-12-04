import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("brands")
export class Brand {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  logo: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
