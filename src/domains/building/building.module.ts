import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { BuildingService } from './building.service';

@Module({
    imports: [TypeOrmModule.forFeature([Building])],
    providers: [BuildingService],
    exports: [BuildingService],
})
export class BuildingModule {}
