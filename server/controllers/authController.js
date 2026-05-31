import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { createNotification } from "../utils/createNotification.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Register a new user (client)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      password, // will be hashed by the pre‑save hook
      role: "client", // force client role on registration
    });

    if (user) {
      try {
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          await createNotification(
            admin._id,
            `Nouvel utilisateur inscrit : ${nom} ${prenom} (${email}).`,
            "new_user",
            `/admin/users`, // Remplacez par le lien de votre tableau de bord admin
          );
        }
      } catch (notifErr) {
        console.error(
          "Erreur lors de l'envoi de la notification aux admins:",
          notifErr,
        );
      }
      res.status(201).json({
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400);
      throw new Error("Données utilisateur invalides");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // NEW: Check if user is banned before generating token
      if (user.isBanned) {
        res.status(403);
        throw new Error("Votre compte a été suspendu par un administrateur.");
      }

      res.json({
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401);
      throw new Error("Email ou mot de passe incorrect");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }
    // Ensure documents always exists as an object
    res.json({
      ...user,
      documents: {
        cinRecto: "",
        cinVerso: "",
        justificatifRevenu: "",
        contratTravail: "",
        releveBancaire: "",
        ...(user.documents || {}),
      },
      documentsVerifies: user.documentsVerifies || false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password (generates token & sends email)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404);
      throw new Error("Aucun utilisateur trouvé avec cet email.");
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url (pointing to React frontend)
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    const message = `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte E-Crédit.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour configurer un nouveau mot de passe (ce lien expire dans 10 minutes) :</p>
      <a href="${resetUrl}" style="background-color: #1E3A8A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Réinitialiser mon mot de passe</a>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: message,
      });

      res
        .status(200)
        .json({ success: true, message: "Email envoyé avec succès." });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500);
      throw new Error("Erreur lors de l'envoi de l'email.");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token from URL parameter
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with valid token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Le lien de réinitialisation est invalide ou a expiré.");
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Mot de passe réinitialisé avec succès.",
      });
  } catch (error) {
    next(error);
  }
};
