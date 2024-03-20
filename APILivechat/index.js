import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from "cookie-parser"
import cors from "cors"
import fs from 'fs'
import compression from 'compression'
import cmd from 'node-cmd'
import formData from 'express-form-data';
import router from './routes/livechat.js'

// import router from './routes/sendmessage'
const app=express();

dotenv.config();

const connect = async () => {
    try {
      await mongoose.connect("mongodb://0.0.0.0:27017");
      console.log("Connected to mongoDB.");
    } catch (error) {
      throw error;
    }
  };

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

let date = Number(String(fs.readFileSync('utils/today.txt', 'utf8')));
let count= Number(String(fs.readFileSync('utils/request.txt', 'utf8')));
function countMiddleware(req,res,next){
   if(next)next()
   let takeDate = Number(new Date().getDate());
   if(takeDate != date){
     count =0;
     date = takeDate;
     fs.writeFileSync('utils/today.txt',String(date));
   };
   count++;
  //  console.log(count);
   fs.writeFileSync('utils/request.txt',String(count));
}

// app.use(untiInjection);
// app.use(countMiddleware);
app.use(compression());
app.use(cors()) // cho phép truy cập từ mọi client 
app.use(cookieParser())
app.use("/api", router)
// app.use(morgan('combined'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");  
app.use(express.static("public"));
app.get('/restart', async (req, res) => {
  try {
    await cmd.runSync('pm2 stop index');
    await cmd.runSync('pm2 start index');
    res.send('Xong')
  }
  catch (e) {
    console.log('error restart', e);
  }
})
// app.use("/livechat",sendmessage)
//FE 
app.get("/frontend/takeHistoryAccess",(req,res)=>{
  return res.render("takeHistoryAccess");
});
const myConsole = new console.Console(fs.createWriteStream('./logs/IpHome.log'));
app.get("/takeiphome",(req,res)=>{
  myConsole.log(req.ip);
  return res.json("ok");
});
app.listen(9000,()=>{
  connect();
  console.log("Connected to databse");
  console.log("Backend is running on http://localhost:9000")
})
