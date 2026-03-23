let userModel = require('../schemas/users')
let bcrypt = require('bcrypt')

// Generate random 16-character password
function generateRandomPassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

module.exports = {
    CreateAnUser: async function (username, password, email, role, session,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl: avatarUrl,
            fullName: fullName,
            status: status,
            loginCount: loginCount
        })
        await newUser.save({session});
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username: username });
        if (!getUser) {
            return false;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            return getUser;
        }
        return false;

    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role')
    },
    FindUserByEmail: async function (email) {
        return await userModel.findOne({
            email: email,
            isDeleted: false
        })
    },
    FindUserByToken: async function (token) {
        let user = await userModel.findOne({
            forgotpasswordToken: token,
            isDeleted: false
        })
        if (!user || user.forgotpasswordTokenExp < Date.now()) {
            return false
        }
        return user
    },
    ImportUsersFromExcel: async function (users, roleId, sendMailFunction) {
        let results = [];
        for (const user of users) {
            try {
                const randomPassword = generateRandomPassword();
                
                // Check if username already exists
                let existingUser = await userModel.findOne({ username: user.username });
                if (existingUser) {
                    results.push({
                        username: user.username,
                        status: 'failed',
                        message: 'Username already exists'
                    });
                    continue;
                }

                // Check if email already exists
                let existingEmail = await userModel.findOne({ email: user.email });
                if (existingEmail) {
                    results.push({
                        username: user.username,
                        status: 'failed',
                        message: 'Email already exists'
                    });
                    continue;
                }

                // Create new user
                let newUser = new userModel({
                    username: user.username,
                    password: randomPassword,
                    email: user.email,
                    role: roleId,
                    status: false,
                    loginCount: 0
                });
                
                await newUser.save();

                // Send password email
                try {
                    await sendMailFunction(user.email, user.username, randomPassword);
                    results.push({
                        username: user.username,
                        email: user.email,
                        password: randomPassword,
                        status: 'success',
                        message: 'User created and email sent'
                    });
                } catch (emailError) {
                    results.push({
                        username: user.username,
                        email: user.email,
                        password: randomPassword,
                        status: 'success_no_email',
                        message: 'User created but email failed to send'
                    });
                }
            } catch (error) {
                results.push({
                    username: user.username,
                    status: 'failed',
                    message: error.message
                });
            }
        }
        return results;
    }
}