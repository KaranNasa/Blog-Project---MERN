const mongoose=require('mongoose');

const {Schema,model}=mongoose;

// Defining the schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true, 
        min: 4,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
});

// Making model
const UserModel = model('User',userSchema);

module.exports = UserModel;