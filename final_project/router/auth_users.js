const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "lab", password: "password123" }
];

const isValid = (username)=>{ 
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
 return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
 const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }
  const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });
  req.session.token = accessToken;
  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
 const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username; // From JWT
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/modified successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // From JWT
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
