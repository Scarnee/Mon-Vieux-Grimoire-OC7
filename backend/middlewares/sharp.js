const sharp = require("sharp");
path = require("path");
fs = require("fs");

module.exports = (req, res, next) => {
    // On vérifie si un fichier a été téléchargé
    if (!req.file) {
        return next();
    }

    const extension = req.file.filename.split(".").pop();
    const filename = req.file.filename.split(`.${extension}`)[0];

    sharp(req.file.path)
      .resize({ width: 500 })
      .webp({ quality: 80 })
      .toFile(`images/resized_${filename}.webp`)
      .then(() => {
        fs.unlink(`images/${req.file.filename}`, () => {
          req.file.path = `images/${filename}.webp`;
          req.file.filename = `${filename}.webp`;
          next();
        });
      })
        .catch((err) => {
            console.log(err);
            return next();
        });
};
