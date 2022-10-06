// All dependacies for project
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const express = require("express");
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const PORT = 8080; // default port 8080

const app = express();

// Import functions from helpers
const { lookUpEmail, cookieCheck, generateRandomShortURL, generateRandomUserID, urlsForUser } = require('./helpers');

// url Database and the user Database objects
const urlDatabase = {};
const users = {};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['ChocolateChipCookie'],
  maxAge: 24 * 60 * 60 * 1000
}));

// Populates list of urls available to the user.
// Will be prompted to login via urls_index if user is undefined
app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);

});

// Form for creating a new URL, if there are no cookies or a cookie is detected but does not match one of the users, 
// client is redirected to login page instead
app.get("/urls/new", (req, res) => {

  if (cookieCheck(req.session.user_id, users)) {

    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);

  } else {

    res.redirect("/login");

  };
});

// Shows the shortened url created in more detail and allows a new long URL to be populated on the short URL. 
// If the short URL does not exist, error 400.
// If the user does not own the short URL, error 400.
app.get("/urls/:id", (req, res) => {

  const requestedShortURL = urlDatabase[req.params.id];
  const matches = urlsForUser(req.session.user_id, urlDatabase);

  if (cookieCheck(req.session.user_id, users) && matches[req.params.id]) {

    const templateVars = {
      id: req.params.id,
      longURL: requestedShortURL.longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);

  } else if (cookieCheck(req.session.user_id, users) && !urlDatabase[req.params.id]) {

    res.status(400).send("This URL does not exist");

  } else {

    res.status(400).send("You do not have permission to edit this short URL or it is not available");

  };

});

// Directs the client to the long URl the short URL is associated with.
// If no short URL exists, error 400.
app.get("/u/:id", (req, res) => {

  if (urlDatabase[req.params.id]) {

    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);

  } else {

    res.status(400).send("Short URL does not exist.");

  };
});

// Registration page where user can sign up
// If client is logged in, redirect to /urls instead
app.get("/register", (req, res) => {

  if (cookieCheck(req.session.user_id, users)) {

    res.redirect("/urls");

  } else {

    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_register", templateVars);

  };
});

// Login page where user can log in
// If client is logged in, redirect to /urls instead
app.get("/login", (req, res) => {

  if (cookieCheck(req.session.user_id, users)) {

    res.redirect("/urls");

  } else {

    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_login", templateVars);

  };
});

// Form submission for creating a new URL from the urls_new ejs page
// Assigns the shortURL to the databse with a longURL as well as the user ID that created it
app.put("/urls", (req, res) => {

  const ranString = generateRandomShortURL(urlDatabase);
  urlDatabase[ranString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  const templateVars = {
    id: ranString,
    longURL: urlDatabase[ranString].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);

});

// Post submission for deleting a url and its short ID from the /urls page
// Unless the user is authenticated and the id exists in the database, error 400
app.delete("/urls/:id/delete", (req, res) => {

  const matches = urlsForUser(req.session.user_id, urlDatabase);

  if (cookieCheck(req.session.user_id, users) && matches[req.params.id]) {

    delete urlDatabase[req.params.id];
    res.redirect("/urls");

  } else {

    res.status(400).send("You do not have permission to delete this short URL");

  };
});

// Form submission for editing a url and its short ID from the /urls page
// Unless the user is authenticated and the id exists in the database, error 400
app.put("/urls/:id", (req, res) => {

  const matches = urlsForUser(req.session.user_id, urlDatabase);

  if (cookieCheck(req.session.user_id, users) && matches[req.params.id]) {

    urlDatabase[req.params.id].longURL = req.body.updateURL;
    res.redirect("/urls");

  } else {

    res.status(400).send("You do not have permission to edit this short URL");

  };

});

// Form submission for submitting a registration form and adding the user to the database
// If either field is missing, error 400
// If the email already exists in the database, error 400
// If none of the above, create account successfully
app.put("/register", (req, res) => {

  const UID = generateRandomUserID(users);

  if (!req.body.email || !req.body.password) {

    res.status(400).send("You must fill out both fields");

  } else if (lookUpEmail(req.body.email, users)) {

    res.status(400).send("User with email found");

  } else {

    users[UID] = {
      id: UID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = UID;
    res.redirect("/urls");

  };
});

// Form for submitting the login page with the appropriate credentials
// If user does not exist, error 403
// If hashed password does not match, error 403
// if none of the above, successful login
app.put("/login", (req, res) => {

  const userCheck = lookUpEmail(req.body.email, users);

  if (!userCheck) {

    res.status(403).send("User with email cannot be found");

  } else if (userCheck && !bcrypt.compareSync(req.body.password, users[userCheck].password)) {

    res.status(403).send("Incorrect password");

  } else {

    req.session.user_id = userCheck;
    res.redirect("/urls");

  };
});

// logout form and clear the cookie
app.put("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});