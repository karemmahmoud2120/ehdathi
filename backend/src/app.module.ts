import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { TransformModule } from './transform/transform.module';
import { LayersModule } from './layers/layers.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DbModule, TransformModule, LayersModule, AiModule, AuthModule],
})
export class AppModule {}
