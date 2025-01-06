import express from "express"
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

// put : there is something that we're updating
router.put("/update-profile", protectRoute, updateProfile)

// check if user is authenticated
router.get("/check", protectRoute, checkAuth)
export default router