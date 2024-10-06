import mongoose from 'mongoose';
import { User } from '../models/user.js'; 
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const adminSeeding = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (!adminExists) {
            console.log('Admin does not exist, creating admin...');
            const hashedPassword = await bcrypt.hash('admin', saltRounds);
            const createAdmin = new User({
                email: 'admin@gmail.com',
                fname: 'Muhammad Suleman',
                password: hashedPassword,
                role: 'Admin'
            });
            await createAdmin.save();

            const checkAdmin = await User.findOne({ email: 'admin984@gmail.com' });
            if (checkAdmin) {
                console.log('Admin created successfully');
            }
        } else {
            console.log('Admin already exists');
        }
    } catch (error) {
        console.error('Error in admin seeding:', error);
    }
};
