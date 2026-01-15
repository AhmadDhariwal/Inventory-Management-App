const express = require('express');
const userschema = require ('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

//const { v4: uuidv4 } = require('uuid');

async function handleusersignup(req,res){

    try {
        const body = req.body;
        if (!body.name || !body.email || !body.username || !body.password) {
          return res.status(400).json({ error: "Data is required" });
        }
        //const generatedId =  shortid.generate();   // We can also use it for the generateid `ITEM_${Date.now()}`;
     //   const hashedpassword = await bcrypt.hash(body.password, 8);
        const createduser = await userschema.create({
            name: body.name,
            email : body.email,
            username : body.username,
            password: body.password,
           role : body.role,
        })
      await createduser.save();

        const token = jwt.sign({ userid : createduser._id , role : createduser.role }, "Hello", {expiresIn : '1h'});
       
        res.status(201).json({
             message: "User created successfully",
             token: token,
              role : createduser.role,
            item: createduser,
        });
    
            }
        catch (err) {
        console.error("createitem error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }

async function handleuserlogin(req,res){

    try {
        const body = req.body;
        if ( !body.username || !body.password) {
          return res.status(400).json({ error: " Valid Data is required" });
        }
        //const generatedId =  shortid.generate();   // We can also use it for the generateid `ITEM_${Date.now()}`;
    
        const logineduser = await userschema.findOne({
            username : body.username,
            password: body.password,
           
        })
       // const passwordMatch = await bcrypt.compare(password, logineduser.password);
        if(!logineduser){
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const token = jwt.sign({ userid : logineduser._id , role : logineduser.role }, "Hello", {expiresIn : '24h'});
      
        res.status(200).json({
             message: "User found successfully",
             token: token,
             role : logineduser.role,
            item: logineduser ,
        });
    
            }
        catch (err) {
        console.error("finduser error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }


module.exports = {
    handleusersignup,
    handleuserlogin,
};