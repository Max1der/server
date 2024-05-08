import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        login: {
            type: String,
            required: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
        },
        fio: {
            type: String,
            required: true,
        },
        pc: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', UserSchema);
