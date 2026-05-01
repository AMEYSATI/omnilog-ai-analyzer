import bcrypt from 'bcryptjs';
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

export const User = sequelize.define('User', {
  apiKey: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: { // Changed name to 'password' for simplicity
      type: DataTypes.STRING,
      allowNull: false,
    },
}, {
    hooks: {
        // This runs automatically before a new user is saved to Postgres
        beforeCreate: async (User) => {
            const salt = await bcrypt.genSalt(10);
            User.password = await bcrypt.hash(User.password, salt);
        }
    }
});

// Add this helper to check passwords later
User.prototype.checkPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};


export const userConnectDB = async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync(); // This creates the table if it doesn't exist!
    await sequelize.sync({ alter: true }); 
    console.log('✅ PostgreSQL Connected & Tables Synced');
  } catch (error) {
    console.error('❌ Postgres Connection Error:', error);
  }
};