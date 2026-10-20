import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private readonly service: AiService) {}
  @Post('chat') chat(@Body() body: any) { return this.service.chat(body.message, body.history || []); }
}
