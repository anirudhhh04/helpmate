const express=require("express");
const app=express();
const path=require("path");
const multer=require("multer");
const mongoose=require("mongoose");
const cors=require("cors");
const userroute=require('./src/routes/User');
const workerroute=require('./src/routes/Worker');



const port=4000;


app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.static(path.resolve("./public")));
app.use('/images', express.static(path.resolve(__dirname, 'public/images')));
app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));



app.use(express.json());
app.use('/api/user',userroute);
app.use('/api/worker',workerroute);



mongoose.connect('mongodb://127.0.0.1:27017/mini').then(()=> {
    console.log("mongo connected")});

    const storage = multer.diskStorage({
        destination: path.resolve(__dirname, 'public/uploads'),  // Folder to store images
        filename: (req, file, cb) => {
         return cb(null, `${Date.now()}${file.originalname}`); // File naming convention
        },
      });
    const upload = multer({storage:storage});
    app.post('/upload',upload.single('image'),(req,res)=>{
        res.json({
           success:1,
           imageurl:`http://localhost:${port}/uploads/${req.file.filename}`
        })
 });






app.listen(port,()=>{
    console.log("server started");
   
});