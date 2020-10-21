const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuidRandom = require('uuid-random');
const dotenv = require('dotenv');

dotenv.config();

const postModel = require('./postModel');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    birth: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }

    },
    password: {
        type: String,
        trim: true,
        minlength: 6,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Please enter your password!')
            } else if (validator.equals(value.toLowerCase(), "password")) {
                throw new Error('Password is invalid!')
            } else if (validator.contains(value.toLowerCase(), "password")) {
                throw new Error('Password should not contain password!')
            }
        }
    },
    home: {
        name: {
            type: String,
            trim: true,
            default: "none"
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true,
                default: [0, 0]
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    role: {
        type: String,
        required: true,
        default: 'USER',
        enum: ['USER', 'MODERATOR', 'ADMIN']
    },
    validRunCode: {
        code: {
            type: String,
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    activatedUser: {
        code: {
            type: String,
        },
        active: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    passwordAccount: {
        type: Boolean,
        required: true,
        default: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: Date.now
    }
}, {
    toObject: { virtuals: true }
});

userSchema.virtual('age').get(function () {
    if (this.birth) {
        return Math.floor((Date.now() - this.birth.getTime()) / (1000 * 3600 * 24 * 365));
    } else {
        return 0;
    }
})

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
})

userSchema.virtual('givenRuns', {
    ref: 'Run',
    localField: '_id',
    foreignField: 'driver'
})

userSchema.virtual('receivedRuns', {
    ref: 'Run',
    localField: '_id',
    foreignField: 'passengers.passenger'
})

userSchema.virtual('chats', {
    ref: 'Chat',
    localField: '_id',
    foreignField: 'partecipants.partecipant'
})

userSchema.statics.checkValidCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login 2')
    }

    if (user.passwordAccount) {
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new Error('Unable to login 2')
        }
    }

    return user
}

userSchema.methods.newAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.newValidRunCode = async function () {
    const user = this
    const code = uuidRandom()
    user.validRunCode.code = code
    user.validRunCode.generatedAt = Date.now()
    await user.save()
    return user.validRunCode
}

userSchema.methods.newEmailCode = async function () {
    const user = this
    const code = uuidRandom()
    user.activatedUser.code = code
    await user.save()
    return user.activatedUser.code
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.validRunCode
    delete userObj.activatedUser
    delete userObj.passwordAccount

    return userObj
}

//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this
    await postModel.deleteMany({ author: user._id })
    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;