const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function verifytoken(req,res,next){

     const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ') ) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing"
    });
  }
    const token =  authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Error!Token was not provided."
            });
        }
    try{
        const decoded = jwt.verify(token,"Hello");
        req.user = { id: decoded.userid }; // Fix: Create req.user object
        req.userid = decoded.userid;
        req.role = decoded.role;
        next();
    }catch(err){
        return res.status(401).json({message:"Invalid token"});
    
    }
};

// async function restrictto(req, res, next) {
//     if(!req.userid){
//         return res.status(401).json({message:"Invalid token"});
//     }
    
//     role = req.headers.role;
//     if(!)
//     next();
// }

function restrictto(role = []){
    return async function (req, res, next){
        if(!req.userid){
            return res.status(401).json({message:"Invalid token"});
        }
       
        if( !role.includes(req.role)){
            return res.status(401).json({message:"Unauthorized"});
        }
        next();
    }
}
async function user (req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "Hello");

    req.user = { id: decoded.userid };
    req.userid = decoded.userid;

   
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
    verifytoken,
    restrictto,
    user,
}



// try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Authorization header missing",
    //   });
    // }

    // const parts = authHeader.split(" ");

    // if (parts.length !== 2 || parts[0] !== "Bearer") {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid authorization format",
    //   });
    // }

    // const token = parts[1]; try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Authorization header missing",
    //   });
    // }

    // const parts = authHeader.split(" ");

    // if (parts.length !== 2 || parts[0] !== "Bearer") {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid authorization format",
    //   });
    // }

    // const token = parts[1];