import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema(
    {
            text: {
                type: String,
                required: true,
            },
            level: {
                type: String,
                required: true,
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            status:{
                type: String,
                default: 'Ожидает',
            },
            resolver:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Problem', ProblemSchema);
