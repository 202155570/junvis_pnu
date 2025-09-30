import { Controller, Get, Post, Query, Body, Req } from '@nestjs/common'
import { LifelogService } from './lifelog.service'

@Controller('lifelog') // 최종 경로는 /api/lifelog/...
export class LifelogController {
  constructor(private readonly lifelogService: LifelogService) {}

  @Get('timeline')
  timeline(@Query('from') from: string, @Query('to') to: string, @Query('granularity') granularity?: string, @Query('tag') tag?: string, @Query('place') place?: string) {
    return this.lifelogService.timeline({ from, to, granularity, tag, place })
  }

  @Post('entries')
  create(@Req() req, @Body() dto: any) {
    const userId = req.user?.id ?? 'anonymous'
    return this.lifelogService.createEntry(userId, dto)
  }
}
