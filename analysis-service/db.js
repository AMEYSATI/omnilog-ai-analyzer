import { Sequelize, DataTypes } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import 'dotenv/config';

const sequelize = new Sequelize({
  // Database configuration
  dialect: PostgresDialect,
  url: process.env.POSTGRES_URL,
  logging: false,
});

export const AnalysisResult = sequelize.define('AnalysisResult', {
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

// Function to connect to the database
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // This creates the table if it doesn't exist!
    console.log('✅ PostgreSQL Connected & Tables Synced');
  } catch (error) {
    console.error('❌ Postgres Connection Error:', error);
  }
};