import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './src/config/db.js'
import User from "./src/models/Users.js";
dotenv.config()
const port = process.env.PORT
const app = express()
app.use(cors())

const db =  await connectDB();

app.listen(port,()=>{
    console.log(`app is running on server ${port}`);
});
