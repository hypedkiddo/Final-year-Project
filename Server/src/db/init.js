// Caution:This file Erases and completely reintialises the database
import dotenv from "dotenv";
dotenv.config({
    path: "../../.env"
});
import { sampledata } from "./data.js";
import { Event } from "../models/event.models.js";
import connectdatabase from "./index.js";

connectdatabase();

//function
const initdb=async()=>{
    await Event.deleteMany({});
    const data= await Event.insertMany(sampledata);
    console.log("Data was intialized");
};

initdb();



