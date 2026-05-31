import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S'assurer que le dossier uploads/documents existe
const uploadDir = path.join(__dirname, "..", "uploads", "documents");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `doc-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers PDF, JPG, JPEG et PNG sont acceptés"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5Mo max par fichier
});

// NOUVEAU: Exporter spécifiquement la configuration pour les champs multiples de demande de crédit
export const uploadLoanDocuments = upload.fields([
  { name: "cinRecto", maxCount: 1 },
  { name: "cinVerso", maxCount: 1 },
  { name: "salarySlips", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "workCertificate", maxCount: 1 },
  { name: "taxDeclaration", maxCount: 1 },
  { name: "proofOfAddress", maxCount: 1 },
  { name: "businessRegistration", maxCount: 1 },
]);

export default upload;
