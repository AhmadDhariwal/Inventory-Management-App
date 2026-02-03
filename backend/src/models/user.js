const mongoose = require('mongoose');

const userschema = new mongoose.Schema( {

    name : {
        type : String ,
        required : true ,
    },
    email : {
        type : String ,
        required : true ,
        unique : true ,
    },
    username:{
        type: String,
        require:true,
        unique: true,
    },
    password : {
        type : String ,
        required : true ,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'manager' , 'admin'],
        required: true,
    },
    phone: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    }

},{timestamps : true});

const User = mongoose.model('user', userschema);

module.exports = User;