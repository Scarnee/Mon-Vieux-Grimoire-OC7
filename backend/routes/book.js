const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const sharp = require("../middlewares/sharp");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestRating);
router.get("/:id", bookCtrl.getOneBook);
1;

router.post("/", auth, multer, sharp, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.postRating);

router.put("/:id", auth, multer, sharp, bookCtrl.modifyBook);

router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
