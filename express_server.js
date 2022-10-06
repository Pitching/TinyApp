const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

const { lookUpEmail, cookieCheck, generateRandomString, generateRandomUserID, urlsForUser } = require('./helpers');

const urlDatabase = {};

const users = {};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['ChocolateChipCookie'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {

  if (cookieCheck(req.session.user_id, users)) {

    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);

  } else {

    res.redirect("/login");

  }
});

app.get("/urls/:id", (req, res) => {

  const requestedShortURL = urlDatabase[req.params.id];
  const matches = urlsForUser(req.session.user_id, urlDatabase)

  if (cookieCheck(req.session.user_id, users) && matches[req.params.id]) {

    const templateVars = { id: req.params.id, longURL: requestedShortURL.longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);

  } else if (!matches[req.params.id]) {

    res.status(400).send("This URL does not exist");

  } else {

    res.status(400).send("You do not have permission to edit this short URL");

  }
  
});

app.get("/u/:id", (req, res) => {

  if (urlDatabase[req.params.id]) {

    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);

  } else {

    res.status(400).send("Short URL does not exist.");

  }
});

app.get("/register", (req, res) => {

  if (cookieCheck(req.session.user_id, users)) {

    res.redirect("/urls");

  } else {

    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_register", templateVars);

  }
})

app.get("/login", (req, res) => {

  if (cookieCheck(req.session.user_id, users)) {

    res.redirect("/urls");

  } else {

    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_login", templateVars);

  }
})

app.post("/urls", (req, res) => {

  const ranString = generateRandomString(); // Generates a unique 6 character string that is assigned to the object and passed to the urls_show template
  urlDatabase[ranString] = { longURL: req.body.longURL, userID: req.session.user_id };
  const templateVars = { id: ranString, longURL: urlDatabase[ranString].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);

});

app.post("/urls/:id/delete", (req, res) => {

  const matches = urlsForUser(req.session.user_id, urlDatabase)

  if (cookieCheck(req.session.user_id, users) && matches[req.params.id]) {

    delete urlDatabase[req.params.id];
    res.redirect("/urls");

  } else {

    res.status(400).send("You do not have permission to delete this short URL");

  }
})

app.post("/urls/:id", (req, res) => {

    urlDatabase[req.params.id].longURL = req.body.updateURL;
    res.redirect("/urls");

})

app.post("/register", (req, res) => {

  const UID = generateRandomUserID(users);

  if (!req.body.email || !req.body.password) {

    res.status(400).send("You must fill out both fields");

  } else if (lookUpEmail(req.body.email, users)) {

    res.status(400).send("User with email found");

  } else {

    users[UID] = { id: UID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id = UID;
    res.redirect("/urls");
    console.log(users);

  }
})

app.post("/login", (req, res) => {

  const userCheck = lookUpEmail(req.body.email, users);

  if (!userCheck) {

    res.status(403).send("User with email cannot be found");

  } else if (userCheck && !(bcrypt.compareSync(req.body.password, users[userCheck].password))) {

    res.status(403).send("Incorrect password");

  } else {

    req.session.user_id = userCheck.id;
    res.redirect("/urls");

  }
})

app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});