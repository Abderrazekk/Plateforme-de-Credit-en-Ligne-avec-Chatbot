// @desc    Upload a document file
// @route   POST /api/upload/document
// @access  Private (client)
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Aucun fichier fourni');
    }
    // Return relative path (we'll serve it via /api/documents/:filename)
    const filePath = `uploads/documents/${req.file.filename}`;
    res.status(201).json({ filePath });
  } catch (error) {
    next(error);
  }
};