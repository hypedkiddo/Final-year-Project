import {asyncHandler} from "../utils/asyncHandler.js"; //Wrappper to handle asynchronous functions
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Event} from "../models/event.models.js";

///-----------List all Events
const showlistings=asyncHandler(async(req,res)=>{
    const data= await Event.find({});
    res.status(200)
    .json(
        new ApiResponse(200,data,"Data sent successfully")
    )
})


//--------------Create an Event-------------------
const createlistings=asyncHandler(async(req,res)=>{
    const {title,description,price,location}=req.body
    //get the local file path from multer
    if (!req.files?.image || req.files.image.length === 0) {
        throw new ApiError(400, "No image file uploaded");
    }    
    const eventImageLocalPath=req.files?.image[0]?.path;
    //upload it in cloudinary
    const eventimageurl=await uploadOnCloudinary(eventImageLocalPath);
    if(!eventimageurl){
        throw new ApiError(500,"Something went wrong while uploading image to cloudinary")
    }
    const newevent= await Event.create({
        title,
        description,
        image:eventimageurl.url,
        price,
        location 
    })
    res.status(200).json(
        new ApiResponse(200,newevent,"New Event created successfully")
    )
})
//--------------update  an Event-------------------
const updatelistings=asyncHandler(async(req,res)=>{
    const {id}=req.params
    const {title,description,price,location}=req.body

    const existingEvent=await Event.findById(id)
    if(!existingEvent){
        throw new ApiError(404, "Event not found")
    }
    let eventimageurl = existingEvent.image;
    if (req.files?.image && req.files.image.length > 0) {
        const eventImageLocalPath = req.files.image[0].path;

        try {
            eventimageurl = await uploadOnCloudinary(eventImageLocalPath)

            // Optional: Delete the old image from Cloudinary (if applicable)
            // await deleteFromCloudinary(existingEvent.image);
        } catch (error) {
            throw new ApiError(500, "Error uploading new image to Cloudinary")
        }
    }
    //now update it to database
    const updatedEvent=await Event.findByIdAndUpdate(id,{
                title: title || existingEvent.title,
                description: description || existingEvent.description,
                image: eventimageurl,
                price: price || existingEvent.price,
                location: location || existingEvent.location,
    },{new:true})
    res.status(200).json(
        new ApiResponse(200,updatedEvent,"Event Updated successfully")
    )
})
//--------------delete an Event-------------------
const deletelistings=asyncHandler(async(req,res)=>{
    const {id}=req.params
    const deletedEvent = await Event.findByIdAndDelete(id);
    if(!deletedEvent){
        throw new ApiError(404,"Event not found")
    }
    res.status(200).json(
        new ApiResponse(200,deletedEvent," Event deleted successfully")
    )
})

export {showlistings,updatelistings,createlistings,deletelistings}