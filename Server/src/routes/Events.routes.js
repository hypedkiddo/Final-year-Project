import { Router } from "express";//Router is used for routing towards Specific API endpoints
const router=Router();
import {showlistings} from "../controllers/Events.controller.js";
//default get route to display all events
router.route("/",showlistings);

export default router;

