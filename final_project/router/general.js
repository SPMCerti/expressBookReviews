const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


let getAllBooks = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 3000); 
  });
};

let getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const booksByISBN = Object.values(books).filter(book => book.isbn === isbn);
        if (booksByISBN.length > 0) {
            resolve(booksByISBN);
        } else {
            reject({ status: 404, message: "No books found by this ISBN" });
        }
    });
};

const getByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject({ status: 404, message: "No books found by this author" });
    }
  });
};

const getByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject({ status: 404, message: "No books found by this title" });
    }
  });
};


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (users[username]) {
    return res.status(400).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getAllBooks(); 
    res.send(JSON.stringify(bookList, null, 2));
  } catch (err) {
    res.status(500).send("Error retrieving books.");
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    getBookByISBN(isbn)
        .then((booksByISBN) => {
            res.json(booksByISBN);
        })
        .catch((err) => {
            res.status(err.status).json({ message: err.message });
        });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  getByAuthor(author)
    .then((books) => res.json(books))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title;

  getByTitle(title)
    .then((books) => res.json(books))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    res.status(200).json(JSON.stringify(book.reviews, null, 2));
  } else {
    res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
