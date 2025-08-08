import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * User Schema Definition
 * @description Defines the structure for user documents in MongoDB
 */
const userSchema = new Schema({
    // Basic user information
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Password is required']
    },

    // Account verification fields
    isAccountVerified: { 
        type: Boolean, 
        default: false 
    },
    verifyOtp: { 
        type: String, 
        default: '' 
    },
    verifyOtpExpiry: { 
        type: Number, 
        default: 0 
    },

    // Password reset fields
    forgotPasswordOtp: { 
        type: String, 
        default: '' 
    },
    forgotPasswordOtpExpiry: { 
        type: Number, 
        default: 0 
    }
}, {
    // Enable timestamps for createdAt and updatedAt
    timestamps: true
});

// Create the model from the schema and handle existing model case
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;
