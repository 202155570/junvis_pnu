import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LifelogEntry } from '../database/entities/lifelog-entry.entity'
import { LifelogController } from './lifelog.controller'
import { LifelogService } from './lifelog.service'

@Module({
  imports: [TypeOrmModule.forFeature([LifelogEntry])],
  controllers: [LifelogController],
  providers: [LifelogService],
})
export class LifelogModule {}
