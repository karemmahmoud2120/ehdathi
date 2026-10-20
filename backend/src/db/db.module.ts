import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';

export const PG = 'PG';

@Global()
@Module({
  providers: [
    {
      provide: PG,
      useFactory: () =>
        new Pool({ connectionString: process.env.DATABASE_URL }),
    },
  ],
  exports: [PG],
})
export class DbModule {}