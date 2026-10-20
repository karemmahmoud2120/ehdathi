import { Module } from '@nestjs/common';
import { TransformController, DmsController } from './transform.controller';
import { TransformService } from './transform.service';

@Module({ controllers: [TransformController, DmsController], providers: [TransformService] })
export class TransformModule {}
