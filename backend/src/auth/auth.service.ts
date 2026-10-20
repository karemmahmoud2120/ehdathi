import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import { PG } from '../db/db.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@Inject(PG) private readonly pool: Pool, private readonly jwtService: JwtService) {}

  async register(body: any) {
    const { name, email, password } = body;
    const existing = await this.pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) throw new ConflictException('البريد مسجل بالفعل');
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await this.pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword],
    );
    const token = this.jwtService.sign({ id: rows[0].id, email });
    return { user: rows[0], token };
  }

  async login(body: any) {
    const { email, password } = body;
    const { rows } = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) throw new UnauthorizedException('بيانات غير صحيحة');
    const user = rows[0];
    if (!(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('بيانات غير صحيحة');
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }
}
