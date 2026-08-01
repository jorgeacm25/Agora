// src/config/typeorm.config.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import * as path from 'path';

// FORZAR la carga del .env desde la raíz del proyecto
config({ path: path.resolve(process.cwd(), '.env') });

// Debug - ver qué variables se están cargando
console.log('📁 .env cargado desde:', path.resolve(process.cwd(), '.env'));
console.log('🔍 Variables de entorno:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_USERNAME:', process.env.DB_USERNAME);
console.log('  DB_DATABASE:', process.env.DB_DATABASE);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'practice_delivery',
  entities: [User, 'src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
  migrationsRun: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;