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
       const hashedpassword = await bcrypt.hash(body.password, 8);
       //console.log(hashedpassword);
        const createduser = await userschema.create({
            name: body.name,
            email : body.email,
            username : body.username,
            password: hashedpassword,
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
           // password: body.password,
           
        })
       // const passwordMatch = await bcrypt.compare(password, logineduser.password);
        if(!logineduser){
            return res.status(401).json({ error: "Invalid username or password" });
        }
        const passwordMatch = await bcrypt.compare(body.password, logineduser.password);

        if (!passwordMatch) {
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

async function updateUserProfile(req, res) {
    try {
        const userId = req.user.userid;
        const { name, phone, department } = req.body;
        
        const updatedUser = await userschema.findByIdAndUpdate(
            userId,
            { name, phone, department },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function getUserProfile(req, res) {
    try {
        const userId = req.user.userid;
        const user = await userschema.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user.userid;
        const { currentPassword, newPassword } = req.body;
        
        const user = await userschema.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (user.password !== currentPassword) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function getActiveSessions(req, res) {
    try {
        const sessions = [{
            id: '1',
            device: 'Chrome on Windows',
            location: 'New York, US',
            lastActive: new Date(),
            current: true
        }];
        
        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (err) {
        console.error("Get sessions error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function terminateSession(req, res) {
    try {
        res.status(200).json({
            success: true,
            message: "Session terminated successfully"
        });
    } catch (err) {
        console.error("Terminate session error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    handleusersignup,
    handleuserlogin,
    updateUserProfile,
    getUserProfile,
    changePassword,
    getActiveSessions,
    terminateSession,
};