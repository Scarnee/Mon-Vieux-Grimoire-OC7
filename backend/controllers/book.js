const Book = require("../models/Book.js");
const fs = require("fs");

// Methode pour aller chercher tous les livres //

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};

// Methode pour aller chercher un livre //

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((thing) => res.status(200).json(thing))
        .catch((error) => res.status(404).json({ error }));
};

//Methode pour afficher les 3 meilleurs livres par note moyenne //

exports.getBestRating = (req, res, next) => {
    Book.find()
        .then((books) => books.sort((a, b) => b.averageRating - a.averageRating))
        .then((books) => res.status(200).json([books[0], books[1], books[2]]))
        .catch((error) => res.status(400).json({ error }));
};


// Methode pour ajouter un livre a la BDD //

exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    console.log(bookObject);
    delete bookObject._userId;
    delete bookObject._id;

    console.log(bookObject);

    const filename = req.file.filename;

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${filename}`,
    });
    console.log(book);
    try {
        await book.save();
        res.status(201).json({ message: "Book saved" });
    } catch (error) {
        fs.unlinkSync(`images/${filename}`);
        res.status(400).json({ error });
    }
};

// Methode pour modifier un livre //

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
          }
        : { ...req.body };

    delete bookObject.userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(400).json({ message: "Non autorise" });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "object modified" }))
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => res.status(400).json({ error }));
};
