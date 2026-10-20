import { Controller, Get, Post, Delete, Patch, Param, Body } from '@nestjs/common';
import { LayersService } from './layers.service';

@Controller('api/layers')
export class LayersController {
  constructor(private readonly service: LayersService) {}
  @Get('stats') getStats() { return this.service.getStats(); }
  @Get() getAll() { return this.service.getAllLayers(); }
  @Post() create(@Body() body: any) { return this.service.createLayer(body.name, body.color || '#D4AF37'); }
  @Patch(':id') rename(@Param('id') id: string, @Body() body: any) { return this.service.renameLayer(Number(id), body.name); }
  @Patch(':id/color') updateColor(@Param('id') id: string, @Body() body: any) { return this.service.updateLayerColor(Number(id), body.color); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.deleteLayer(Number(id)); }
  @Post(':id/features') addFeature(@Param('id') id: string, @Body() body: any) { return this.service.addFeature(Number(id), body); }
  @Delete('features/:id') deleteFeature(@Param('id') id: string) { return this.service.deleteFeature(Number(id)); }
  @Get(':id/geojson') getGeojson(@Param('id') id: string) { return this.service.getLayerGeoJSON(Number(id)); }
}

