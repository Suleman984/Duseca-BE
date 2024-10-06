import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";

import { adminSeeding } from "./Seeders/AdminSeeding.js";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import {
  authenticateToken,
  authorizeAdmin,
  authorizeAdminOrManager,
} from "./middleware/authMiddleware.js";
import cors from "cors";
import { Task } from "./models/task.js";
import { User } from "./models/user.js";
import { authToken } from "./models/authenticationToken.js";
const saltRounds = 10;

dotenv.config(); // To load the .env file

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 7000;
const mongoURL = process.env.MONGO_URL;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURL);
    // Seed admin
    await adminSeeding();
    // Start the server
    app.listen(port, () => {
      console.log("Server running successfully on port", port);
    });
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

// Login route
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   // console.log(email)
//   try {
//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password." });
//     }
//     // Generate a JWT token
//     const token = user.generateAuthToken();
//     const userDetail=await User.findOne({email})
//     const getUser=await User.findOne({email}).select('_id')
//     const userId = getUser ? getUser._id.toString() : null;
//     console.log(userId)
//     try{
//       const storeAuthToken=new authToken({
//         userId,
//         authToken:token
//       })
//       await storeAuthToken.save();
//       console.log('Authentication Token Added Successfully')
//     }catch(e){
//       console.log('Error : ',e)
//     }

//     res.json({ token ,userDetail});
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = user.generateAuthToken();

    // Fetch the user ID
    const getUser = await User.findOne({ email }).select("_id"); // Corrected field selection
    const userId = getUser ? getUser._id.toString() : null; // Convert ObjectId to string
    console.log("User ID:", userId); // Log the user ID for debugging

    if (!userId) {
      return res.status(500).json({ message: "User ID not found" });
    }

    // Store the auth token in the authToken collection
    try {
      console.log(typeof userId);
      const existingToken = await authToken.findOne({ userId });
      if (existingToken) {
        console.log("Token already exists for this user");
      } else {
        const storeAuthToken = new authToken({
          userId,
          authToken: token,
        });
        await storeAuthToken.save();
        console.log("Authentication Token Added Successfully");
      }
    } catch (e) {
      console.log("Error storing the authentication token:", e);
    }

    res.json({ token, userDetail: user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//create User
app.post(
  "/create-user",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { email, fname, password, role, manager } = req.body;

    if (!email || !fname || !password || !role) {
      return res.status(400).json({ message: "Please provide all details" });
    }

    try {
      // Check if the user already exists
      const isUserExisting = await User.findOne({ email });
      if (isUserExisting) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      //check if manager Exists
      let managerId = null;
      if (manager) {
        const findManager = await User.findOne({ _id: manager }).select("_id");
        if (!findManager) {
          return res.status(404).json({ message: "Manager not found" });
        }
        managerId = findManager._id; // Store the manager's ID
      }



      // Create the new user with the manager's ID ,iif exists
      const createUser = new User({
        email,
        fname,
        password: hashedPassword,
        role,
        manager: managerId, // Save the manager's ID
      });

      

      await createUser.save();

      if (managerId) {
        await User.findByIdAndUpdate(managerId, {
          $push: { assignedUsers: createUser._id }
        });
      }
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
//create Task
app.post("/create-task", authenticateToken, async (req, res) => {
  const { title, desc, dueDate, status } = req.body;
  console.log("ID: ", req.user._id);
  try {
    const newTask = new Task({
      title,
      desc,
      dueDate,
      status,
      employeeId: req.user._id, // Include the employee ID
    });
    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task", error });
  }
});

app.get("/user-tasks", authenticateToken, async (req, res) => {
console.log("updated id: ",req.query.userId);
    let userId = req.query.userId;
    try {
      if (userId) {
        const tasks = await Task.find({ employeeId: userId });
        // console.log("Tasks: ", tasks);
        
        res.send(tasks);
      }
    } catch (e) {
      console.log("error", e);
    }
  
  res.end();
});

app.get("/users", authenticateToken, authorizeAdminOrManager, async (req, res) => {
  try {
      let users = [];
      if (req.user.role == 'Admin') {
        if(req.query.role === 'managers') {
          users = await User.find({role: 'manager'}).populate("manager");
        } else {
          users = await User.find({}).populate("manager");
        }
      } else if (req.user.role == 'manager') {
        users = await User.find({manager: req.user._id}).populate("manager");
      }

      console.log("Users ", users);
      

      if (users) res.json(users);
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/users-and-tasks", authenticateToken, async (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access Denied, No Token provided" });
  }

  // Check if the header starts with "Bearer "
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  // console.log("Token", token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied, Invalid Token format" });
  } else {
    let managerId = await authToken
      .findOne({ authToken: token })
      .select("userId");
    managerId = managerId.userId;
    console.log("Manager Id : ", managerId);
    try {
      if (managerId) {
        const employees = await User.find({ manager: managerId });
        if (employees.length > 0) {
          console.log("employees Under This Manager : ", employees);
        } else {
          console.log("No employees Under this Manager");
        }
        res.send(employees);
      }
    } catch (e) {
      console.log("Error finding employees", e);
    }
  }
  res.end();
});
app.delete("/delete-task/:taskId", authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({ _id: taskId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user._id.toString(); // Convert req.user._id to string
    const taskEmployeeId = task.employeeId.toString(); // Convert task.employeeId to string
    let isAuthorized = false;

    if (req.user.role === 'Admin') {
      console.log('Task deleted by Admin');
      isAuthorized = true;
    } else if (userId === taskEmployeeId) {
      console.log('Task deleted by assigned employee');
      isAuthorized = true;
    } else {
      const user=await User.findById(userId);
      if(user.assignedUsers.includes(taskEmployeeId)){
        console.log("deleted by manager")
        isAuthorized = true;
      } 
      
    }

    if (isAuthorized) {
      await Task.findOneAndDelete({_id:taskId })
    }else {

      return res.status(403).json({ message: "You are not authorized to delete this task" });
    }

    res.end();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
});


startServer();
