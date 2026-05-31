import { useState } from "react";
import api from "../../services/api";

export default function DocumentUploader({ label, currentPath, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);

    // Afficher l'aperçu si c'est une image
    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("document", file);
    setUploading(true);

    try {
      const { data } = await api.post("/upload/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(data.filePath);
      setFile(null);
      setPreview(null);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors du téléchargement du fichier",
      );
    } finally {
      setUploading(false);
    }
  };

  const basename = currentPath ? currentPath.split("/").pop() : null;

  return (
    <div className="border border-gray-200 p-4 rounded-xl bg-gray-50 transition hover:shadow-sm">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        {label}
      </label>

      {/* Afficher le document existant si la variable currentPath est fournie */}
      {currentPath && !file && (
        <div className="mb-4 bg-white p-3 border rounded text-sm flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Fichier existant enregistré
          </span>
          <a
            href={`/api/documents/${basename}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Aperçu
          </a>
        </div>
      )}

      {/* Input de sélection de fichier */}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="mb-3 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100 cursor-pointer"
      />

      {/* Prévisualisation de l'image sélectionnée */}
      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="Aperçu"
            className="h-32 w-auto object-cover rounded-lg shadow-sm border border-gray-200"
          />
        </div>
      )}

      {/* Bouton d'upload (uniquement visible si un fichier est sélectionné) */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition disabled:bg-gray-400"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            "Téléverser ce nouveau fichier"
          )}
        </button>
      )}
    </div>
  );
}
