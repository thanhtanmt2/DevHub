require('dotenv').config();
const { sequelize } = require('./src/models');

const syncDB = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected! Syncing tables...');
    
    // Sync all models (create tables if not exist)
    const forceDrop = process.argv.includes('--force');
    await sequelize.sync({ force: forceDrop, alter: !forceDrop });
    
    console.log('✅ All tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync error:', error);
    process.exit(1);
  }
};

syncDB();
