import express,{urlencoded} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,//Accept requests from these origin routes only
    credentials:true
}));

app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

//Register and Login  a user
import userRouter from "./routes/User.routes.js"
app.use("/api/v1/users",userRouter);

//Handling CRUD operations on Event 

export default app;