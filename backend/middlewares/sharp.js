const multer = require("multer");
const sharp = require("sharp");
path = require("path");
fs = require("fs");

module.exports = (req, res, next) => {
    // On vérifie si un fichier a été téléchargé
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const outputFilePath = path.join("images", `resized_${fileName}`);

    sharp(filePath)
        .resize( null, 508,{
            fit:'contain'
        } )
        .toFile(outputFilePath)
        .then(() => {
            // Remplacer le fichier original par le fichier redimensionné
            fs.unlink(filePath, () => {
                req.file.path = outputFilePath;
                next();
            });
        })
        .catch((err) => {
            console.log(err);
            return next();
        });
};
