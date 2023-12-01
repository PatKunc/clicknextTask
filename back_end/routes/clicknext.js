import express, { query } from "express";
import db from "../config/database.js";
import { ObjectId } from "mongodb";

// import req from "express/lib/request"

// const argon2 = require('argon2');
// const jwt = require('jsonwebtoken');
// import express from 'express';
// import db from '../config/database.js';
// import argon2 from "argon2"; // Import argon2
import jwt from "jsonwebtoken"; // Import jwt


// const secretKey = "bronze1212312121";
const router = express.Router();

// router.post("/generateToken", (req, res) => { 
//     // Validate User Here 
//     // Then generate JWT Token 
  
//     let jwtSecretKey = process.env.JWT_SECRET_KEY; 
//     let data = { 
//         time: Date(), 
//         userId: 12, 
//     } 
  
//     const token = jwt.sign(data, jwtSecretKey); 
  
//     res.send(token); 
// });
// router.get("/validateToken", (req, res) => { 
//     // Tokens are generally passed in the header of the request 
//     // Due to security reasons. 
  
//     let tokenHeaderKey = process.env.TOKEN_HEADER_KEY; 
//     let jwtSecretKey = process.env.JWT_SECRET_KEY; 
  
//     try { 
//         const token = req.header('Authorization'); 
  
//         const verified = jwt.verify(token, jwtSecretKey); 
//         if(verified){ 
//             return res.send("Successfully Verified"); 
//         }else{ 
//             // Access Denied 
//             return res.status(401).send(error); 
//         } 
//     } catch (error) { 
//         // Access Denied 
//         return res.status(401).send(error); 
//     } 
// });

const authenticateToken = (req, res, next) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY; 
    const token = req.header('Authorization');
    if (!token) {
      console.error('Token not provided');
      return res.status(401).json({ error: 'Access denied' });
    }
  
    jwt.verify(token, jwtSecretKey, (err, user) => {
      if (err) {
        console.error('Invalid token:', err.message);
        return res.status(403).json({ error: 'Invalid token' });
      }
    //   console.log('Token verified successfully. User:', user);
    //   req.UserID = user;
      next();
    });
   
  };
  
  router.get("/user", authenticateToken, async (req, res) => {
    console.log('User:', req.user); // Log the user obtained from the token
    let limit = Number(req.query.limit) || 5;
    let collection = await db.collection("user");
    let results = await collection.find({}).limit(limit).limit(5).toArray();
  
    res.send(results).status(200);
  });

router.get("/transactionById/:id",authenticateToken, async (req, res) => {
  try {
    let userID = parseInt(req.params.id);
    let collection = await db.collection("transactions");
    let results = await collection.find({ UserID: userID }).toArray();

    res.send(results).status(200);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/usernameById/:id",authenticateToken, async (req, res) => {
  try {
    let userID = parseInt(req.params.id);
    let collection = await db.collection("user");
    let results = await collection.find({ UserID: userID},{Username:1}).toArray();

    res.send(results).status(200);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/check", async (req, res) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY; 
  try {
    // รับ request body มา (Obj ที่ส่งมาจาก front)
    const { Username, Password } = req.body;

    // find user in db
    const user = await db.collection("user").findOne({ Username });

    if (!user) {
      // ไม่เจอ user return 404
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the provided password matches the stored password
    if (user.Password === Password) {
      // If the passwords match, generate a JWT token
      const token = jwt.sign({ UserID: user.UserID }, jwtSecretKey, {
        expiresIn: "1h",
      });

      // Log the JWT token value
      console.log("JWT Token:", token);

      // Return status 200 along with the token
      return res.status(200).json({ message: "Password matches", token });
    } else {
      // If the passwords do not match, return status 404
      return res.status(401).json({ error: "Password does not match" });
    }
  } catch (error) {
    // If there is an error, return status 500
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userByUsername/:username",authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await db.collection("user").findOne({ Username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const balance = user.Balance; //คืนเงิน Balance ไป

    return res.status(200).json({ username, balance });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/balanceByUsername/:username",authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // Assuming you have a 'users' collection in your database
    const user = await db.collection("user").findOne({ Username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const balance = user.Balance; 

    return res.status(200).json({ username, balance });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/deposit/:username",authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { amount } = req.query;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    const user = await db.collection("user").findOne({ Username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the balance in the db
    const updatedBalance = user.Balance + depositAmount;

    // Assuming you have a 'users' collection in your db
    await db
      .collection("user")
      .updateOne({ Username: username }, { $set: { Balance: updatedBalance } });

    return res.status(200).json({ username, updatedBalance });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/withdraw/:username",authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { amount } = req.query;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    const user = await db.collection("user").findOne({ Username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else if (user.Balance < withdrawAmount) {
      return res
        .status(401)
        .json({ error: "The amount is not enough to withdraw" });
    }

    const updatedBalance = user.Balance - withdrawAmount;

    await db
      .collection("user")
      .updateOne({ Username: username }, { $set: { Balance: updatedBalance } });

    return res.status(200).json({ username, updatedBalance });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/doTransaction",authenticateToken, async (req, res) => {
  try {
    const { UserID, type, amount, remain } = req.body;

    const newTransaction = {
      UserID,
      type,
      timestamp: new Date(),
      amount,
      remain,
    };

    const result = await db
      .collection("transactions")
      .insertOne(newTransaction);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/transfer",authenticateToken, async (req, res) => {
  try {
    const { UserID, transferorId, receiverId, amount, type, remain } = req.body;

    const transferor = await db
      .collection("user")
      .findOne({ UserID: parseInt(transferorId) });
    const receiver = await db
      .collection("user")
      .findOne({ UserID: parseInt(receiverId) });

    // Check if both transferor and receiver exist
    if (!transferor || !receiver) {
      return res.status(404).json({ error: "One or more users not found" });
    }

    if (receiverId === transferorId) {
      return res.status(401).json({ error: "Can not transfer to yourself" });
    }

    // Check if the transferor has enough balance
    if (transferor.Balance < amount) {
      return res
        .status(400)
        .json({ error: "Insufficient balance for transfer" });
    }

    // Update balances for transferor and receiver
    await db
      .collection("user")
      .updateOne(
        { UserID: parseInt(transferorId) },
        { $inc: { Balance: -amount } }
      );
    await db
      .collection("user")
      .updateOne(
        { UserID: parseInt(receiverId) },
        { $inc: { Balance: amount } }
      );

    // Add transaction record
    await db.collection("transactions").insertOne({
      UserID,
      transferorId,
      receiverId,
      type,
      timestamp: new Date(),
      amount,
      remain,
    });

    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
