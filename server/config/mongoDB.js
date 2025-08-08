
import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB using the provided connection URI from environment variables.
 * Implements error handling for connection failures.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Add recommended connection options
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // Exit process with failure if database connection is critical
        process.exit(1);
    }
};

export default connectDB;
