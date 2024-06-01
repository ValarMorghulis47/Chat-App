import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    bio: {
        type: String,
        required: true
    },
    avatar_url: {
        type: String,
        required: true
    },
    avatar_public_id: {
        type: String,
        required: true
    },
},{
    timestamps: true
})


// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
    else {
        return next();
    }
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
}

export const User = mongoose.model('User', userSchema);

