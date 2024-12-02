import {asyncHandler} from "../utils/asyncHandler.js"; //Wrappper to handle asynchronous functions
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Event} from "../models/event.models.js";

const showlistings=asyncHandler(async(req,res)=>{
    const data= await Event.find({});
    console.log(data);
    console.log("This is new branch")
})

export {showlistings};