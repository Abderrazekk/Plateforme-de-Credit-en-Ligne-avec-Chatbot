import { useState, useEffect } from "react";
import api from "../../services/api";

export default function DocumentViewer({ filename, label }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!filename) return;

    // Si filename inclut le chemin complet (ex: "uploads/documents/doc-123.pdf")
    // On extrait uniquement le nom du fichier pour faire l'appel à l'API
    const basename = filename.split("/").pop();

    api
      .get(`/documents/${basename}`, { responseType: "blob" })
      .then((res) => {
        const blob = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => setError(true));

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename]);

  if (!filename)
    return <span className="text-gray-400 text-xs italic">Non fourni</span>;
  if (error)
    return (
      <span className="text-red-500 text-xs font-medium">Erreur fichier</span>
    );
  if (!blobUrl)
    return <span className="text-gray-400 text-xs">Chargement...</span>;

  const isPDF = filename.toLowerCase().endsWith(".pdf");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 underline text-xs font-semibold focus:outline-none"
      >
        {label || "Voir le document"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative animation-fade-in">
            {/* Header du modal */}
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-700">
                Visionneuse de document sécurisée
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contenu du document */}
            <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center p-4">
              {isPDF ? (
                <iframe
                  src={blobUrl}
                  title="Document PDF"
                  className="w-full h-full rounded shadow-sm border border-gray-200"
                />
              ) : (
                <img
                  src={blobUrl}
                  alt="Aperçu du document"
                  className="max-w-full max-h-full object-contain rounded shadow-sm border border-gray-200"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
