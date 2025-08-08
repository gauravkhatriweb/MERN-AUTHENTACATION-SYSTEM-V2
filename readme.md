# MERN Authentication System - Backend Documentation

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [Backend API Reference](#backend-api-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [User Management Endpoints](#user-management-endpoints)
- [Testing Guide](#testing-guide)
  - [Prerequisites](#testing-prerequisites)
  - [Authentication Flow Testing](#authentication-flow-testing)
  - [Password Reset Flow Testing](#password-reset-flow-testing)
  - [cURL Examples](#curl-examples)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [License](#license)

## Overview

A robust and secure authentication/user management API built with the MERN stack. This system provides comprehensive user authentication features including registration, login, email verification, password reset, and secure user data management.

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd MERN-AUTHENTACATION-SYSTEM

# Install dependencies
cd server
npm install

# Set up .env file (see Environment Variables section)

# Start server
npm start
```

## Backend Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas account)
- Email account for sending verification emails

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MERN-AUTHENTACATION-SYSTEM
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=4000                              # Server port
MONGODB_URI=your_mongodb_connection    # MongoDB connection string
JWT_SECRET=your_jwt_secret_key         # Secret for JWT signing
EMAIL_USER=your_email@gmail.com        # Email for sending OTPs
EMAIL_PASS=your_email_app_password     # Email app password
```

### Running the Server

Development mode (with auto-restart):
```bash
npm run server
```

Production mode:
```bash
npm start
```

The server will start on http://localhost:4000 (or the port specified in your .env file).

## Backend API Reference

### Authentication Endpoints

| Method | URL | Description | Auth Required |
|--------|-----|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | No |
| POST | `/api/auth/send-verification-otp` | Send account verification OTP | Yes |
| POST | `/api/auth/verify-otp` | Verify account with OTP | Yes |
| POST | `/api/auth/send-reset-password-otp` | Send password reset OTP | No |
| POST | `/api/auth/reset-password` | Reset password with OTP | No |
| POST | `/api/auth/is-authenticated` | Check authentication status | Yes |

### User Management Endpoints

| Method | URL | Description | Auth Required |
|--------|-----|-------------|---------------|
| GET | `/api/user/get-user-data` | Get user profile data | Yes |

### Detailed API Documentation

#### Authentication Endpoints

##### 1. Register a New User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | name | String | Yes | User's full name |
  | email | String | Yes | User's email address |
  | password | String | Yes | User's password (min 6 characters) |

- **Example Request**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- **Success Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Registration successful",
      "data": {
        "email": "john@example.com"
      }
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request - Missing fields
    ```json
    {
      "success": false,
      "message": "All fields are required"
    }
    ```
  - **Code**: 400 Bad Request - User exists
    ```json
    {
      "success": false,
      "message": "User already exists"
    }
    ```
  - **Code**: 400 Bad Request - Password too short
    ```json
    {
      "success": false,
      "message": "Password must be at least 6 characters"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error during registration"
    }
    ```

- **Notes**: Upon successful registration, a JWT token is set in an HTTP-only cookie and a welcome email is sent to the user.

##### 2. User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | email | String | Yes | User's email address |
  | password | String | Yes | User's password |

- **Example Request**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "email": "john@example.com",
        "name": "John Doe",
        "isVerified": false
      }
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request - Missing fields
    ```json
    {
      "success": false,
      "message": "Email and password are required"
    }
    ```
  - **Code**: 401 Unauthorized - Invalid credentials
    ```json
    {
      "success": false,
      "message": "Invalid email or password"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error during login"
    }
    ```

- **Notes**: Upon successful login, a JWT token is set in an HTTP-only cookie.

##### 3. User Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**: None

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Logout successful"
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized - No session
    ```json
    {
      "success": false,
      "message": "No active session found"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error during logout"
    }
    ```

- **Notes**: This endpoint clears the authentication cookie.

##### 4. Send Verification OTP
- **URL**: `/api/auth/send-verification-otp`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**: None

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Verification OTP sent successfully"
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request - Already verified
    ```json
    {
      "success": false,
      "message": "Account is already verified"
    }
    ```
  - **Code**: 404 Not Found - User not found
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error while sending verification OTP"
    }
    ```

- **Notes**: A 6-digit OTP is generated and sent to the user's email. The OTP expires after 10 minutes.

##### 5. Verify OTP
- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | otp | String | Yes | 6-digit verification code |

- **Example Request**:
  ```json
  {
    "otp": "123456"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Account verified successfully"
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request - Missing OTP
    ```json
    {
      "success": false,
      "message": "OTP is required"
    }
    ```
  - **Code**: 400 Bad Request - Invalid OTP
    ```json
    {
      "success": false,
      "message": "Invalid OTP"
    }
    ```
  - **Code**: 400 Bad Request - Expired OTP
    ```json
    {
      "success": false,
      "message": "OTP has expired"
    }
    ```
  - **Code**: 404 Not Found - User not found
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error while verifying OTP"
    }
    ```

- **Notes**: Upon successful verification, the user's account is marked as verified.

##### 6. Send Password Reset OTP
- **URL**: `/api/auth/send-reset-password-otp`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | email | String | Yes | User's email address |

- **Example Request**:
  ```json
  {
    "email": "john@example.com"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Password reset OTP sent successfully"
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request - Missing email
    ```json
    {
      "success": false,
      "message": "Email is required"
    }
    ```
  - **Code**: 400 Bad Request - Unverified account
    ```json
    {
      "success": false,
      "message": "Account is not verified. Please verify your account first"
    }
    ```
  - **Code**: 404 Not Found - User not found
    ```json
    {
      "success": false,
      "message": "No account found with this email"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error while sending reset password OTP"
    }
    ```

- **Notes**: A 6-digit OTP is generated and sent to the user's email. The OTP expires after 10 minutes.

##### 7. Reset Password
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | email | String | Yes | User's email address |
  | otp | String | Yes | 6-digit verification code |
  | newPassword | String | Yes | New password (min 6 characters) |

- **Example Request**:
  ```json
  {
    "email": "john@example.com",
    "otp": "123456",
    "newPassword": "newsecurepassword"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Password reset successful"
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request - Missing fields
    ```json
    {
      "success": false,
      "message": "Email, OTP, and new password are required"
    }
    ```
  - **Code**: 400 Bad Request - Password too short
    ```json
    {
      "success": false,
      "message": "New password must be at least 6 characters"
    }
    ```
  - **Code**: 400 Bad Request - Invalid OTP
    ```json
    {
      "success": false,
      "message": "Invalid OTP"
    }
    ```
  - **Code**: 400 Bad Request - Expired OTP
    ```json
    {
      "success": false,
      "message": "OTP has expired"
    }
    ```
  - **Code**: 400 Bad Request - Same password
    ```json
    {
      "success": false,
      "message": "New password must be different from current password"
    }
    ```
  - **Code**: 404 Not Found - User not found
    ```json
    {
      "success": false,
      "message": "No account found with this email"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error while resetting password"
    }
    ```

- **Notes**: Upon successful password reset, the user's password is updated and the OTP is cleared.

##### 8. Check Authentication Status
- **URL**: `/api/auth/is-authenticated`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**: None

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "User is authenticated"
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized - No token
    ```json
    {
      "success": false,
      "message": "Authentication required. Please login."
    }
    ```
  - **Code**: 401 Unauthorized - Invalid token
    ```json
    {
      "success": false,
      "message": "Invalid or expired token. Please login again."
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error while checking authentication"
    }
    ```

- **Notes**: This endpoint is used to verify if the user's JWT token is valid.

#### User Management Endpoints

##### 1. Get User Data
- **URL**: `/api/user/get-user-data`
- **Method**: `GET`
- **Auth Required**: Yes
- **Request Body**: None

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "User data retrieved successfully",
      "data": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "isVerified": true,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    }
    ```

- **Error Responses**:
  - **Code**: 404 Not Found - User not found
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - **Code**: 500 Internal Server Error
    ```json
    {
      "success": false,
      "message": "Internal server error while fetching user data"
    }
    ```

- **Notes**: This endpoint returns the user's profile data excluding sensitive information like password and OTPs.

## Testing Guide

### Testing Prerequisites

1. Install [Postman](https://www.postman.com/downloads/) or any API testing tool
2. Set up the server as described in the Backend Setup section
3. Make sure the server is running on the configured port

### Authentication Flow Testing

#### 1. Register a New User

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }
     ```

2. **Expected Response**:
   - Status: `201 Created`
   - Body contains success message and user email
   - JWT token is set in cookies

#### 2. Login

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains success message and user data
   - JWT token is set in cookies

#### 3. Send Verification OTP

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/send-verification-otp`
   - Headers: `Cookie: token=<jwt-token-from-login>`

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains success message
   - Check email for OTP

#### 4. Verify OTP

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/verify-otp`
   - Headers: `Cookie: token=<jwt-token-from-login>`
   - Body:
     ```json
     {
       "otp": "<otp-from-email>"
     }
     ```

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains success message

#### 5. Get User Data

1. **Request**:
   - Method: `GET`
   - URL: `http://localhost:4000/api/user/get-user-data`
   - Headers: `Cookie: token=<jwt-token-from-login>`

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains user profile data

#### 6. Logout

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/logout`
   - Headers: `Cookie: token=<jwt-token-from-login>`

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains success message
   - Token cookie is cleared

### Password Reset Flow Testing

#### 1. Send Password Reset OTP

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/send-reset-password-otp`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "test@example.com"
     }
     ```

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains success message
   - Check email for OTP

#### 2. Reset Password

1. **Request**:
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/reset-password`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "test@example.com",
       "otp": "<otp-from-email>",
       "newPassword": "newpassword123"
     }
     ```

2. **Expected Response**:
   - Status: `200 OK`
   - Body contains success message

### cURL Examples

#### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

#### Get User Data
```bash
curl -X GET http://localhost:4000/api/user/get-user-data \
  -b cookies.txt
```

#### Logout
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -b cookies.txt
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Email Service**: Nodemailer
- **Security**: bcryptjs for password hashing

## Project Structure

```
server/
├── config/
│   ├── emailService.js    # Email configuration and service
│   └── mongoDB.js         # Database connection setup
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── userController.js  # User management logic
├── middlewares/
│   └── userAuth.js        # JWT authentication middleware
├── models/
│   └── userModel.js       # User schema and model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   └── userRoute.js       # User management routes
└── server.js              # Main application entry
```

## Frontend Documentation – Coming Soon

The frontend documentation will be added in a future update.

## License

MIT License

---

Maintained and enhanced by [Gaurav Khatri](https://github.com/gauravkhatriweb)