import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateProfile,
  updatePassword,
  uploadAvatar,
  verifyUserDocuments,
  toggleUserBan,
  deleteUser,
} from "../controllers/userController.js";
import protect from "../middlewares/auth.js";
import authorize from "../middlewares/roleCheck.js";
import uploadAvatarMiddleware from "../middlewares/uploadAvatar.js";

const router = express.Router();

router.use(protect);

// Shared Routes for Admin
router.get("/", authorize("admin"), getAllUsers);
router.post("/", authorize("admin"), createUser);

// Admin exclusive management tools
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id/verify-documents", authorize("admin"), verifyUserDocuments);

router.put("/:id/toggle-ban", authorize("admin"), toggleUserBan);
router.delete("/:id", authorize("admin"), deleteUser);

// Client account profile management routes
router.put("/profile", authorize("client", "admin"), updateProfile);
router.put("/password", authorize("client", "admin"), updatePassword);
router.post(
  "/avatar",
  authorize("client", "admin"),
  uploadAvatarMiddleware.single("avatar"),
  uploadAvatar,
);

export default router;
