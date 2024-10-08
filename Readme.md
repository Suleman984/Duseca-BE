**************Backend for User Management System***********
This is the backend part of the User Management System, built with Node.js and Express.js, which handles user authentication, role-based access control, and CRUD operations. It integrates MongoDB as the database and uses JWT (JSON Web Token) for secure user authentication.

*************Table of Contents*****************
Features
Technology Stack
Installation
Environment Variables
Directory Structure
Authentication
JWT Authentication
Password Hashing
Models & Schemas
Middlewares
Database Seeding
API Endpoints

*******************Features******************
JWT Authentication: User authentication and authorization are handled using JWT tokens with an expiry time of 7 days.
Password Hashing: Secure password storage using bcrypt.
Role-Based Access Control: Admin, Manager, and User roles with different access levels.
MongoDB Integration: Used for storing user, task, and employee data.
Seeding Admin User: On application start, the backend checks if an Admin user exists. If not, it creates one.

***********************Technology Stack******************
Node.js: Backend runtime environment.
Express.js: Web framework for handling HTTP requests and routes.
MongoDB: NoSQL database for storing user, task, and employee data.
JWT (JSON Web Token): For secure user authentication.
bcrypt: For hashing passwords.
dotenv: For managing sensitive environment variables.

**************INSTALLATION*******************
1- Clone the repository :git clone https://github.com/Suleman984/Duseca-BE.git
2-npm install
3-Start the development server
npm start
**************************Environment Variables*******************
PORT=8000
MONGO_URI=your_mongo_database_uri
JWT_SECRET=your_jwt_secret_key

****************Directory Structure*********************
src/
│
├── controllers/
│   ├── authController.js      # Handles login and user authentication
│   ├── taskController.js      # Handles task-related operations
│   └── userController.js      # Handles user-related operations
│
├── middlewares/
│   ├── authenticateToken.js   # JWT authentication middleware
│
├── models/
│   ├── User.js                # User model and schema
│   ├── Task.js                # Task model and schema
│   └── Employee.js            # Employee model and schema
│
├── routes/
│   ├── authRoutes.js          # Authentication routes (login, register)
│   ├── taskRoutes.js          # Task CRUD routes
│   └── userRoutes.js          # User management routes
│
├── seeder/
│   └── adminSeeder.js         # Seeder to create default admin user
│
├── app.js                     # Main application entry point
└── server.js                  # Server initialization


****************************Authentication***************************
JWT Authentication
The backend uses JWT (JSON Web Token) to authenticate users. Upon successful login, a JWT token is issued with a validity period of 7 days. The token is passed with each request in the Authorization header in the following format:

This token is then validated in protected routes using a middleware (authenticateToken.js) to ensure only authorized users can access those routes.

************************Password Hashing**************************
For secure password storage, bcrypt is used to hash passwords before they are saved in the database. During login, the hashed password is compared with the stored hash to authenticate users.

****************************Models and Schemas*******************************
User Model (User.js)
The User schema includes fields like:

name: User's full name.
email: User's email, used for login.
password: Hashed password stored using bcrypt.
role: Defines the role of the user (Admin, Manager, User).
Task Model (Task.js)
The Task schema includes:

title: Title of the task.
description: Description of the task.
status: Status of the task (e.g., pending, completed).
dueDate: Deadline for the task.
employeeId: The ID of the employee assigned to the task.
Employee Model (Employee.js)
The Employee schema includes:

name: Employee's name.
email: Employee's email.
managerId: The ID of the manager who supervises the employee.

***********************Middlewares*******************
Authentication Middleware (authenticateToken.js)
This middleware ensures that only authenticated users with valid JWT tokens can access certain routes. It checks the Authorization header for the token, verifies it using the JWT secret key, and attaches the decoded user information to the request object.

**************Database Seeding************
Admin Seeder (adminSeeder.js)
The seeder checks if an Admin user already exists in the database. If not, it creates one with predefined credentials. This ensures that at least one Admin is present in the system upon initial setup.

****************API Endpoints***************
Authentication Routes (authRoutes.js)
POST /login: Authenticates the user with email and password, issues a JWT token on successful login.
User Management Routes (userRoutes.js)
POST /create-user: Allows Admin to create a new employee.
GET /users: Retrieves all users (Admin access only).
Task Management Routes (taskRoutes.js)
POST /create-task: Allows a user to create a task.
GET /tasks: Retrieves all tasks for the logged-in user.
DELETE /delete-task/:taskId: Deletes a task based on its ID (role-based access).




***********************Data stored in Mongodb compass**************************
