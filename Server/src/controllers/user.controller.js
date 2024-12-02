import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong in generating access and refresh token")
    }
}
// --------------Register user-----------------
const registeruser=asyncHandler(async(req,res)=>{
    
    const {username,password,email,role}=req.body;
    //front-end validation
    if([username,password,email,role].some((item)=>item?.trim()=="")){
        throw ApiError(400,"All fields are required");
    }
    //check if user already exists
    const existeduser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw ApiError(400,"User with given username and email already exists");
    }
    //Check for user Photo
    console.log(req.files)
    const photoLocalPath=req.files?.photo[0]?.path;//multer will inject this path
    if(!photoLocalPath){
        throw ApiError(400,"User Photo is required");
    }
    //Upload on Cloudinary
    const photo=await uploadOnCloudinary(photoLocalPath);
    console.log(photo);
    //Create a user object and save it in database
    const user= await User.create({
        username,
        password,
        email,
        role,
        photo:photo.url
    })

    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if(!createduser){
        throw ApiError(500,"Error while Registering the user");
    }
    //return response
    return res.status(200).json(
        new ApiResponse(200,createduser,"User registered successfully")
    )
})

//---------Login user--------
const loginUser=asyncHandler(async(req,res)=>{
    const{email,username,password}=req.body;

    if(!(username || email)){
        throw new ApiError(400,"Username or email required")
    }

    const user=await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"User not found");
    }

    //if user found then check the validity of password
    const isvalidpassword=await user.isPasswordCorrect(password);
    if(!isvalidpassword){
        throw new ApiError(400,"Password Incorrect");
    }
    //If everything is correct generate Access and refresh token
    const {accessToken,refreshToken}=generateAccessAndRefreshTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    //Setting these options makes cookie modifyable only through server side
   const options={
    httpOnly:true,
    secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
       new ApiResponse(
          200,{
             user:loggedInUser,accessToken,refreshToken
          },
          "User logged in successfully"
       )
    )
})
//-------Logout user-----------
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
     }
  
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"User logged out"))
})
//End point to refresh access
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
 
    if(!incomingRefreshToken){
       throw new ApiError(401,"Unauthorised access");
    }
 
   const decodedToken= jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
 
    const user=await User.findById(decodedToken?._id);
 
    if (!user) {
       throw new ApiError(401,"invalid refresh token ie malicious token received")
    }
 
    if (incomingRefreshToken !== user.refreshToken) {
       throw new ApiError(401,"refresh token is expired or used");
    }
 
    const options={
       httpOnly:true,
       secure:true
    }
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id);
 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
       new ApiResponse(
          200,{
             accessToken,newrefreshToken
          },
          "Access token refreshed"
       )
    )
 })

export {registeruser,loginUser,logoutUser,refreshAccessToken};

