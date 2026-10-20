import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG } from '../db/db.module';
import { TransformDto } from './transform.dto';

@Injectable()
export class TransformService {
  constructor(@Inject(PG) private readonly pool: Pool) {}

  async transform(dto: TransformDto) {
    const { sourceSrid, targetSrid, points } = dto;

    // نبني استعلام واحد يحوّل كل النقاط دفعة واحدة
    const values = points.map((p, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',');
    const params = points.flatMap((p) => [p.x, p.y]);

    const sql = `
      SELECT x_out, y_out
      FROM (
        SELECT
          ST_X(ST_Transform(
            ST_SetSRID(ST_MakePoint(x::float8, y::float8), $${params.length + 1}::integer),
            $${params.length + 2}::integer
          )) AS x_out,
          ST_Y(ST_Transform(
            ST_SetSRID(ST_MakePoint(x::float8, y::float8), $${params.length + 1}::integer),
            $${params.length + 2}::integer
          )) AS y_out
        FROM (VALUES ${values}) AS t(x, y)
      ) q
    `;

    const { rows } = await this.pool.query(sql, [...params, sourceSrid, targetSrid]);

    return rows.map((r) => ({ x: Number(r.x_out), y: Number(r.y_out) }));
  }
}
