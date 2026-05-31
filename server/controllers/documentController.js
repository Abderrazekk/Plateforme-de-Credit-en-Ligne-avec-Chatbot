import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Loan from "../models/Loan.js"; // NOUVEAU : Importation du modèle Loan

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Serve a document securely (owner or admin)
// @route   GET /api/documents/:filename
// @access  Private
export const serveDocument = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const searchPath = `uploads/documents/${filename}`;

    // 1. Chercher si le fichier appartient directement au profil de l'utilisateur (Ancienne méthode / Profil)
    const user = await User.findOne({
      $or: [
        { "documents.cinRecto": searchPath },
        { "documents.cinVerso": searchPath },
        { "documents.justificatifRevenu": searchPath },
        { "documents.contratTravail": searchPath },
        { "documents.releveBancaire": searchPath },
      ],
    });

    // 2. Chercher si le fichier appartient à une demande de crédit (Nouvelle méthode / Multi-étapes)
    const loan = await Loan.findOne({
      $or: [
        { "documents.cinRecto": searchPath },
        { "documents.cinVerso": searchPath },
        { "documents.salarySlips": searchPath },
        { "documents.bankStatement": searchPath },
        { "documents.workCertificate": searchPath },
        { "documents.taxDeclaration": searchPath },
        { "documents.proofOfAddress": searchPath },
        { "documents.businessRegistration": searchPath },
      ],
    });

    // Si le fichier n'est répertorié dans aucune des deux collections, on refuse l'accès
    if (!user && !loan) {
      return res
        .status(404)
        .json({
          message: "Fichier non trouvé ou non répertorié en base de données",
        });
    }

    // 3. Vérification des permissions strictes
    let isAuthorized = false;

    if (req.user.role === "admin") {
      isAuthorized = true; // L'admin a accès à tout
    } else {
      // Si c'est un client, on vérifie qu'il est bien le propriétaire de ce fichier
      if (user && user._id.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
      if (loan && loan.client.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à ce document" });
    }

    // 4. Vérification physique du fichier sur le serveur
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "documents",
      filename,
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({
          message: "Le fichier physique est introuvable sur le serveur",
        });
    }

    // 5. Détermination du type MIME pour l'affichage dans le navigateur
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
