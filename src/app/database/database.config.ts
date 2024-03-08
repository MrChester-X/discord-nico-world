import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export type DatabaseConfigType = TypeOrmModuleOptions & DataSourceOptions;

export default registerAs<DatabaseConfigType>('database', () => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'postgres',
    logging: process.env.logging === 'true',
    synchronize: true,
    autoLoadEntities: true,
    entities: [join(__dirname, '../..', '/**/**/*.entity{.ts,.js}')],
  };
});
