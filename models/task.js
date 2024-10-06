import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to Employee
});

// Export the Task model
export const Task = mongoose.model("Task", TaskSchema);
