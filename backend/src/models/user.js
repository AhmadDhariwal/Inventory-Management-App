const express = require('express');
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
        enum: ['user', 'admin'],
        required: true,
    }

},{timestamps : true});


const signup = mongoose.model('signup', userschema);

module.exports = signup;