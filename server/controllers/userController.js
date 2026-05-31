import User from "../models/User.js";
import Loan from "../models/Loan.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Get all users (Admin sees Admins+Agents+Clients, Agent sees Clients ONLY)
// @route   GET /api/users
// @access  Private (Admin / Agent)
export const getAllUsers = async (req, res, next) => {
  try {
    // Dynamic Role Filter based on requester role
    // Admin can now see all accounts including other Admins
    const query = req.user.role === "agent" ? { role: "client" } : {}; // Admin sees everyone

    const users = await User.find(query).select("-password").lean();

    // Attach loan count to each user
    const usersWithLoanCount = await Promise.all(
      users.map(async (user) => {
        const loanCount = await Loan.countDocuments({ client: user._id });
        return { ...user, loanCount };
      }),
    );

    res.json(usersWithLoanCount);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (Client, Agent or Admin)
// @route   POST /api/users
// @access  Private (Admin / Agent)
export const createUser = async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, cin, password, role } = req.body;

    if (!nom || !prenom || !email || !telephone || !cin || !password) {
      res.status(400);
      throw new Error(
        "Veuillez remplir tous les champs obligatoires (incluant CIN et Téléphone).",
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Cet email est déjà utilisé.");
    }

    // Strict Role Enforcement Guard
    let assignedRole = "client";
    if (req.user.role === "admin") {
      // Allow admin to assign 'agent', 'client', or 'admin' roles
      if (["agent", "admin", "client"].includes(role)) {
        assignedRole = role;
      } else {
        assignedRole = "client";
      }
    }

    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      cin,
      password,
      role: assignedRole,
    });

    res.status(201).json({
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      cin: user.cin,
      role: user.role,
      loanCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (client, agent, admin)
export const updateProfile = async (req, res, next) => {
  try {
    const { nom, prenom, telephone, email, cin } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }

    // 1. Email change request validation
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error("Cet email est déjà utilisé par un autre compte");
      }
      user.email = email;
    }

    // 2. Main details update
    user.nom = nom || user.nom;
    user.prenom = prenom || user.prenom;
    user.telephone = telephone || user.telephone;

    // 3. Conditional CIN update (Allowed for 'client' and 'agent' only)
    if (["client", "agent"].includes(user.role)) {
      if (cin !== undefined) {
        user.cin = cin;
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      email: updatedUser.email,
      telephone: updatedUser.telephone,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      cin: updatedUser.cin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private (client)
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400);
      throw new Error("Veuillez fournir l'ancien et le nouveau mot de passe");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      );
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error("Ancien mot de passe incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private (client)
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Aucun fichier fourni");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }
    const filePath = `uploads/avatars/${req.file.filename}`;
    user.avatar = filePath;
    await user.save();
    res.json({ avatar: filePath });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle User Ban Status
// @route   PUT /api/users/:id/toggle-ban
// @access  Private (Admin only)
export const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("Vous ne pouvez pas suspendre votre propre compte.");
    }

    // Prevent banning other admins
    if (user.role === "admin") {
      res.status(400);
      throw new Error(
        "Vous ne pouvez pas suspendre un autre compte administrateur.",
      );
    }

    const { banReason } = req.body;

    if (!user.isBanned) {
      // Action: Banning User
      if (!banReason || !banReason.trim()) {
        res.status(400);
        throw new Error("La raison de suspension est obligatoire.");
      }
      user.isBanned = true;
      user.banReason = banReason.trim();

      // Send Ban Email
      const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
              <h2 style=\"color: #DC2626;\">Suspension de votre compte</h2>
              <p>Bonjour ${user.prenom} ${user.nom},</p>
              <p>Nous vous informons que votre compte sur la plateforme E-Crédit a été suspendu par l'administration.</p>
              <p><strong>Raison de la suspension :</strong></p>
              <blockquote style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 10px 15px; font-style: italic; color: #991B1B;">
                  ${user.banReason}
              </blockquote>
              <p>Si vous estimez qu'il s'agit d'une erreur, vous pouvez contacter notre support client.</p>
              <p>Cordialement,<br/>L'équipe E-Crédit</p>
          </div>
      `;
      await sendEmail({
        to: user.email,
        subject: "Suspension de votre compte E-Crédit",
        html: emailHtml,
      });
    } else {
      // Action: Unbanning User
      const oldReason = user.banReason;

      user.isBanned = false;
      user.banReason = ""; // Clear it from DB

      // Send Unban Email
      const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
              <h2 style="color: #16A34A;">Réactivation de votre compte</h2>
              <p>Bonjour ${user.prenom} ${user.nom},</p>
              <p>Nous avons le plaisir de vous informer que la suspension de votre compte E-Crédit a été levée.</p>
              <p>Pour rappel, votre compte avait été suspendu pour la raison suivante :</p>
              <blockquote style="background-color: #F3F4F6; border-left: 4px solid #9CA3AF; padding: 10px 15px; font-style: italic; color: #4B5563;">
                  ${oldReason || "Aucune raison spécifiée"}
              </blockquote>
              <p>Vous pouvez dès à présent vous connecter et profiter à nouveau de nos services.</p>
              <p>Cordialement,<br/>L'équipe E-Crédit</p>
          </div>
      `;
      await sendEmail({
        to: user.email,
        subject: "Réactivation de votre compte",
        html: emailHtml,
      });
    }

    await user.save();
    res.json({ isBanned: user.isBanned, banReason: user.banReason });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Client Uploaded Documents
// @route   PUT /api/users/:id/verify-documents
// @access  Private (Admin only)
export const verifyUserDocuments = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }

    user.documentsVerifies = true;
    await user.save();

    // Send Verification Approval Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1E3A8A;">Validation de vos documents justificatifs</h2>
          <p>Bonjour ${user.prenom} ${user.nom},</p>
          <p>Nous avons le plaisir de vous informer que vos documents d'identité et justificatifs ont été vérifiés et validés avec succès par notre équipe administrative.</p>
          <p>Votre profil est désormais certifié conforme, ce qui accélère le traitement et l'acceptation de vos demandes de crédit en cours et futures.</p>
          <p>Merci pour votre collaboration.</p>
          <p>Cordialement,<br/>L'équipe E-Crédit</p>
      </div>
    `;
    await sendEmail({
      to: user.email,
      subject: "Vos documents ont été validés",
      html: emailHtml,
    });

    res.json({
      message: "Documents marqués comme vérifiés avec succès",
      documentsVerifies: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user account
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }

    // Protection: Prevent an admin from deleting their own account
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error(
        "Vous ne pouvez pas supprimer votre propre compte principal.",
      );
    }

    // Optional Protection: If you want to prevent deleting other admins
    if (user.role === "admin") {
      res.status(403);
      throw new Error(
        "Action non autorisée: Impossible de supprimer un compte Administrateur.",
      );
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};
