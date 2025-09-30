import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LifelogEntry } from '../database/entities/lifelog-entry.entity'

@Injectable()
export class LifelogService {
  constructor(@InjectRepository(LifelogEntry) private readonly repo: Repository<LifelogEntry>) {}

  async timeline(q: { from: string; to: string; granularity?: string; tag?: string; place?: string }) {
    const qb = this.repo.createQueryBuilder('e')
      .where('e.entryDate BETWEEN :from AND :to', { from: q.from, to: q.to })
      .orderBy('e.entryDate', 'ASC')

    if (q.tag) qb.andWhere(':tag = ANY(e.tags)', { tag: q.tag })
    if (q.place) qb.andWhere('e.address ILIKE :place', { place: `%${q.place}%` })

    const items = await qb.getMany()
    return { items }
  }

  async createEntry(userId: string, dto: {
    entryDate: string; memo?: string; tags?: string[]; imageUrl?: string;
    latitude?: number; longitude?: number; address?: string
  }) {
    const entity = this.repo.create({
      userId,
      entryDate: new Date(dto.entryDate),
      memo: dto.memo,
      tags: dto.tags,
      imageUrl: dto.imageUrl,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address,
    })
    return await this.repo.save(entity)
  }
}
