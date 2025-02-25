const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const cors=require("cors");
const userroute=require('./src/routes/User');
const workerroute=require('./src/routes/Worker');


const port=4000;



app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use(express.json());
app.use('/api/user',userroute);
app.use('/api/worker',workerroute);



mongoose.connect('mongodb://127.0.0.1:27017/mini').then(()=> {
    console.log("mongo connected")});







app.listen(port,()=>{
    console.log("server started");
   
});