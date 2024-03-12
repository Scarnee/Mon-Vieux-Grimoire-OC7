const Book = require("../models/Book");
const fs = require("fs");

// Methode pour aller chercher tous les livres //

exports.getAllBooks = async (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};

// Methode pour aller chercher un livre //

exports.getOneBook = async (req, res, next) => {
    await Book.findOne({ _id: req.params.id })
        .then((thing) => res.status(200).json(thing))
        .catch((error) => res.status(404).json({ error }));
};

//Methode pour afficher les 3 meilleurs livres par note moyenne

exports.getBestRating = async (req, res, next) => {
    await Book.find()
        .then((books) => books.sort((a, b) => b.averageRating - a.averageRating))
        .then((books) => res.status(200).json([books[0], books[1], books[2]]))
        .catch((error) => res.status(400).json({ error }));
};

// Methode pour ajouter un livre a la BDD

exports.createBook = async (req, res, next) => {
    let bookObject = JSON.parse(req.body.book);
    //deleting ids
    delete bookObject._id;
    delete bookObject._userId;

    //preparing book
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`,
    });
    //saving book
    await book
        .save()
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" });
        })
        .catch((error) => {
            fs.unlinkSync(`images/resized_${req.file.filename}`);
            res.status(400).json({ error });
        });
};

// Methode pour modifier un livre //

exports.modifyBook = async (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`,
          }
        : { ...req.body };

    delete bookObject.userId;
    await Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(400).json({ message: "Non autorise" });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                req.file &&
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) console.log(err);
                    });
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "object modified" }))
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => res.status(400).json({ error }));
};

// Methode pour supprimer l'element dans la BDD //

exports.deleteBook = async (req, res, next) => {
    await Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Action non autorisée, veuillez vous connecter" });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({ message: "Objet supprimé !" });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

// Methode pour noter livre

exports.postRating = async (req, res, next) => {
    const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
    };
    const sumRating = 0;
    if (newRating.grade < 0 || newRating.grade > 5) {
        res.status(400).json({ message: "La note doit etre comprise entre 0 et 5" });
    }

    await Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.ratings.find((p) => p.userId === req.body.userId)) {
                res.status(400).json({ message: "Vous avez deja note ce livre" });
            } else {
                book.ratings.push(newRating),
                    (book.averageRating = (book.averageRating * (book.ratings.length - 1) + newRating.grade) / book.ratings.length),
                    book
                        .save()
                        .then((updatedBook) => res.status(201).json(updatedBook))
                        .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(400).json({ error }));
};
