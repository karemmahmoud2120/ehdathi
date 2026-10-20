import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG } from '../db/db.module';

@Injectable()
export class LayersService {
  constructor(@Inject(PG) private readonly pool: Pool) {}
  async getStats() {
    const layersCount = await this.pool.query('SELECT COUNT(*) FROM layers');
    const featuresCount = await this.pool.query('SELECT COUNT(*) FROM features');
    return { layers: Number(layersCount.rows[0].count), features: Number(featuresCount.rows[0].count) };
  }

  async getAllLayers() { return (await this.pool.query('SELECT * FROM layers ORDER BY id DESC')).rows; }
  async createLayer(name: string, color: string) { return (await this.pool.query('INSERT INTO layers (name, color) VALUES ($1, $2) RETURNING *', [name, color])).rows[0]; }
  async renameLayer(id: number, name: string) { return (await this.pool.query('UPDATE layers SET name = $1 WHERE id = $2 RETURNING *', [name, id])).rows[0]; }
  async updateLayerColor(id: number, color: string) { return (await this.pool.query('UPDATE layers SET color = $1 WHERE id = $2 RETURNING *', [color, id])).rows[0]; }
  async deleteLayer(id: number) { await this.pool.query('DELETE FROM layers WHERE id = $1', [id]); return { success: true }; }
  async addFeature(layerId: number, feature: any) {
    const { rows } = await this.pool.query('INSERT INTO features (layer_id, geom, properties) VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326), $3) RETURNING id', [layerId, JSON.stringify(feature.geometry), JSON.stringify(feature.properties || {})]);
    return { id: rows[0].id };
  }
  async deleteFeature(id: number) { await this.pool.query('DELETE FROM features WHERE id = $1', [id]); return { success: true }; }
  async getLayerGeoJSON(layerId: number) {
    const { rows } = await this.pool.query(`SELECT json_build_object('type', 'FeatureCollection', 'features', COALESCE(json_agg(json_build_object('type', 'Feature', 'id', id, 'geometry', ST_AsGeoJSON(geom)::json, 'properties', properties)), '[]'::json)) as geojson FROM features WHERE layer_id = $1`, [layerId]);
    return rows[0].geojson;
  }
}

