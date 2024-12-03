import { Router } from "express";//Router is used for routing towards Specific API endpoints
const router=Router();
import {showlistings,createlistings,updatelistings,deletelistings} from "../controllers/Events.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyadmin} from "../middlewares/admin.middleware.js"
//default get route to display all events
router.route("/list").get(showlistings)
//Create a particular listing of event
router.route("/create").post(
    upload.fields([
        {
            name:"image",
            maxCount:1

        }
    ]),createlistings)
//Update Event    
router.route("/update/:id").put(
        upload.fields([
            {
                name:"image",
                maxCount:1
    
            }
        ]),updatelistings)
//Delete Event        
router.route("/delete/:id").delete(deletelistings);

export default router;

