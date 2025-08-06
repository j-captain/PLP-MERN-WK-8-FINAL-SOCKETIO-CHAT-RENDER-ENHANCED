const mongoose = require('mongoose');
const colorful = require('../utils/colorful'); // Your colorful logger utility

const connectDB = async () => {
  try {
    // Enhanced environment detection with fallbacks
    const env = process.env.NODE_ENV || 'development';
    
    // Determine which database to use based on environment
    let mongoURI;
    switch(env) {
      case 'test':
        mongoURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/socketio-chat-test';
        break;
      case 'development':
        mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/socketioChat';
        break;
      case 'production':
        mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoURI) {
          throw new Error('Production MongoDB URI must be configured in environment variables');
        }
        break;
      default:
        mongoURI = 'mongodb://localhost:27017/socketioChat';
    }

    // Enhanced connection options with production optimizations
    const connectionOptions = {
      serverSelectionTimeoutMS: env === 'production' ? 10000 : 5000,
      socketTimeoutMS: env === 'production' ? 60000 : 45000,
      maxPoolSize: env === 'production' ? 50 : 10,
      retryWrites: true,
      w: 'majority'
    };

    // Special options for test environment
    if (env === 'test') {
      connectionOptions.serverSelectionTimeoutMS = 3000;
      connectionOptions.socketTimeoutMS = 10000;
    }

    // Production-specific SSL options
    if (env === 'production' && mongoURI.includes('mongodb+srv://')) {
      connectionOptions.ssl = true;
      connectionOptions.authSource = 'admin';
    }

    console.log(colorful.info('\n🔌 Attempting to connect to MongoDB...'));
    console.log(colorful.info(`🌱 Environment: ${env}`));
    console.log(colorful.info('⏳ Please wait...\n'));
    
    const conn = await mongoose.connect(mongoURI, connectionOptions);
    
    // Enhanced connection success message
    console.log(colorful.success('┌──────────────────────────────────────────────┐'));
    console.log(colorful.success('│ ✅  MONGODB CONNECTION SUCCESSFUL           '));
    console.log(colorful.success('├──────────────────────────────────────────────┤'));
    console.log(colorful.success(`│ Environment: ${env.padEnd(28)}`));
    console.log(colorful.success(`│ Database: ${conn.connection.name.padEnd(29)} `));
    console.log(colorful.success(`│ Host: ${conn.connection.host.padEnd(32)}`));
    console.log(colorful.success('└──────────────────────────────────────────────┘\n'));
    
    return conn;
  } catch (error) {
    // Enhanced error reporting
    console.log(colorful.error('\n┌────────────────────────────────────────────┐'));
    console.log(colorful.error('│ ❌  MONGODB CONNECTION FAILED               '));
    console.log(colorful.error('├──────────────────────────────────────────────┤'));
    console.log(colorful.error(`│ Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}│`));
    console.log(colorful.error(`│ Error: ${error.name.padEnd(34)}`));
    console.log(colorful.error(`│ Message: ${error.message.substring(0, 34).padEnd(32)}│`));
    console.log(colorful.error('└──────────────────────────────────────────────┘\n'));
    
    // More detailed error logging for production debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        connectionAttempt: {
          uri: process.env.MONGODB_URI ? '***** (hidden for security)' : 'Not configured',
          env: process.env.NODE_ENV
        }
      });
    }
    
    process.exit(1);
  }
};

// Enhanced database utilities with production safeguards
const dbUtils = {
  connectDB,
  clearDatabase: async () => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear database in production environment');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      console.log(colorful.warn('┌──────────────────────────────────────────────┐'));
      console.log(colorful.warn('│ 🧹  DATABASE CLEARED                        │'));
      console.log(colorful.warn('└──────────────────────────────────────────────┘'));
    }
  },
  closeConnection: async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log(colorful.info('┌──────────────────────────────────────────────┐'));
      console.log(colorful.info('│ 🔌  DATABASE CONNECTION CLOSED              │'));
      console.log(colorful.info('└──────────────────────────────────────────────┘'));
    }
  },
  getConnectionInfo: () => {
    if (mongoose.connection.readyState === 1) {
      return {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        env: process.env.NODE_ENV || 'development'
      };
    }
    return null;
  }
};

module.exports = dbUtils;