import { Sequelize, DataTypes } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import 'dotenv/config';

const sequelize = new Sequelize({
  dialect: PostgresDialect,
  url: process.env.POSTGRES_URL,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // This is necessary for Supabase/Railway
    }
  }
});

export const AnalysisResult = sequelize.define('AnalysisResult', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  stackTrace: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  analysis: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});


export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // This creates the table if it doesn't exist!
    console.log('✅ PostgreSQL Connected & Tables Synced');
  } catch (error) {
    console.error('❌ Postgres Connection Error:', error);
  }
};