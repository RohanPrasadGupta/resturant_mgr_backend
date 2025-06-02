# Restaurant Management System Backend

A comprehensive Node.js backend application for managing restaurant operations including menu items, tables, orders, and user authentication.

## Features

### 🍽️ Menu Management
- Create, read, update, and delete menu items
- Categorize items (appetizers, main courses, desserts, drinks, etc.)
- Price management and availability tracking
- Image support for menu items

### 🪑 Table Management
- Add and manage restaurant tables
- Track table status (available, occupied, reserved)
- Link tables to active orders
- Table capacity management

### 📋 Order Management
- Create and manage customer orders
- Add multiple items to orders
- Real-time order tracking
- Individual item serving status
- Order completion and cancellation
- Update quantities and remove items
- Prevent modifications to served items

### 👥 User Authentication
- User registration and login
- JWT-based authentication
- Role-based access (admin, staff, manager)
- Password encryption using bcrypt

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## Project Structure
![image](https://github.com/user-attachments/assets/234f9cfb-4af3-4493-b1a3-24aff47aa863)

