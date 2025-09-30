// apps/api/src/database/entities/lifelog-entry.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('lifelog_entries')
export class LifelogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ type: 'timestamptz' })
  entryDate: Date

  @Column({ nullable: true })
  imageUrl?: string

  @Column({ type: 'text', nullable: true })
  memo?: string

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number

  @Column({ nullable: true })
  address?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}