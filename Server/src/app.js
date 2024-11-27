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

//routes
import eventrouter from "./routes/Events.routes.js";
app.get("/api/v1/event",eventrouter);
export default app;