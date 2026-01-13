import express from "express";
import { deleteUser, updateUserProfile, getAllUsers, getUserById } from "../controllers/user.js";

const router = express.Router();

// PUT /server/users/:id
router.put("/:id", updateUserProfile);

router.get("/", getAllUsers);

router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
