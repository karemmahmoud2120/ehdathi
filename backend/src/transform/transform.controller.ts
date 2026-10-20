import { Controller, Post, Body } from '@nestjs/common';
import { TransformService } from './transform.service';

@Controller('api/transform')
export class TransformController {
  constructor(private readonly service: TransformService) {}
  @Post() transform(@Body() dto: any) { return this.service.transform(dto); }
}

@Controller('api/dms')
export class DmsController {
  @Post('to-dd') toDd(@Body() b: any) {
    let dd = b.degrees + b.minutes / 60 + b.seconds / 3600;
    if (b.direction === 'S' || b.direction === 'W') dd = -dd;
    return { dd };
  }
  @Post('from-dd') fromDd(@Body() b: any) {
    const abs = Math.abs(b.dd);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = Number((((abs - d) * 60) - m) * 60).toFixed(2);
    return { degrees: d, minutes: m, seconds: s, direction: b.dd >= 0 ? 'N' : 'S' };
  }
}
