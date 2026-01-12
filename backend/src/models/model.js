const express = require('express');
const mongoose = require('mongoose');

const inventoryschema = new mongoose.Schema( {

    name : {
          type : String ,
        required : true ,
    },
    quantity : {
         type : Number ,
        required : true ,
        min : 0,
        default : 0 ,
        
    },
    price :{
         type : Number,
        required : true ,
        min : 0,
    },
    category : {
         type : String ,
        required : true ,
    },
    createdby : {
        type :String,
        required : true ,
    }

},{timestamps : true});

const inventory= mongoose.model('inventory',inventoryschema);

module.exports = inventory;