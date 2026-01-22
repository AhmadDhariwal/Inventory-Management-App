const express = require('express');
const mongoose = require('mongoose');


const productschema = new mongoose.Schema({
     
  name : {
     type : String,
     required : true ,
  },
  sku : {     //stock keeping unit 
    type : String,
    unique : true,
    required: true,
  },
  description : {
    type : String,
  },
  category:{
    type : mongoose.Schema.Types.ObjectId,
    ref:"Category",
    
  },
  cost :{
    type : Number,
    required: true,
  },
  price: {
    type : Number,
    required: true,
  },
  status: {
    type : String,
    enum : ["active","inactive"],
    default : "active",
  }
},{timestamps : true});

const product = mongoose.model("product",productschema);

module.exports = product;