const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {};

const users = {};

function generateRandomString() {
  let r = Math.random().toString(36).slice(2, 8);
  return r;
}

function generateRandomUserID() {
  let r;
  do {
    r = Math.random().toString(16).slice(2);
  } while (users.r);
  return r;
}

const lookupEmail = function (emailExist, users) {

  for (const userID in users) {
    if (users[userID].email === emailExist) {
      return users[userID];
    }
  }

  return null;
}

const urlsForUser = function (id, urlDatabase) {
  let matches = {}

  for (let shortID in urlDatabase) {
    if (urlDatabase[shortID].userID === id) {
      matches[shortID] = urlDatabase[shortID].longURL;
    }
  }

  return matches;
}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {

  if (users[req.cookies["user_id"]]) {

    const templateVars = { urls: urlsForUser(req.cookies["user_id"], urlDatabase), user: users[req.cookies["user_id"]] };
    res.render("urls_index", templateVars);

  } else {

    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_error", templateVars);

  }
});

app.get("/urls/new", (req, res) => {

  if (users[req.cookies["user_id"]]) {

    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);

  } else {

    res.redirect("/login");

  }
});

app.get("/urls/:id", (req, res) => {

  const loggedInCheck = req.cookies["user_id"];
  const requestedShortURL = urlDatabase[req.params.id];
  const matches = urlsForUser(req.cookies["user_id"], urlDatabase)

  if (loggedInCheck && matches[req.params.id]) {

    const templateVars = { id: req.params.id, longURL: requestedShortURL.longURL, user: users[loggedInCheck] };
    res.render("urls_show", templateVars);

  } else if (loggedInCheck && !matches[req.params.id]) {

    res.status(400).send("You do not have permission to edit this short URL");

  } else {

    const templateVars = { user: users[loggedInCheck] };
    res.render("urls_error", templateVars);

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

  if (users[req.cookies["user_id"]]) {

    res.redirect("/urls");
    
  } else {

    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_register", templateVars);

  }
})

app.get("/login", (req, res) => {

  if (users[req.cookies["user_id"]]) {

    res.redirect("/urls");

  } else {

    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_login", templateVars);

  }
})

app.post("/urls", (req, res) => {

  if (users[req.cookies["user_id"]]) {

    const ranString = generateRandomString(); // Generates a unique 6 character string that is assigned to the object and passed to the urls_show template
    urlDatabase[ranString] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    const templateVars = { id: ranString, longURL: urlDatabase[ranString].longURL, user: users[req.cookies["user_id"]] };
    res.render("urls_show", templateVars);

  } else {

    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_error", templateVars);

  }
});

app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect("/urls");

})

app.post("/urls/:id", (req, res) => {

  if (users[req.cookies["user_id"]]) {

    urlDatabase[req.params.id] = req.body.updateURL;
    res.redirect("/urls");

  } else {

    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_error", templateVars);

  }
})

app.post("/register", (req, res) => {

  let UID = generateRandomUserID();

  if (!req.body.email || !req.body.password) {

    res.status(400).send("You must fill out both fields");

  } else if (lookupEmail(req.body.email, users)) {

    res.status(400).send("User with email found");

  } else {

    users[UID] = { id: UID, email: req.body.email, password: req.body.password };
    res.cookie("user_id", UID);
    res.redirect("/urls");

  }
})

app.post("/login", (req, res) => {

  const userCheck = lookupEmail(req.body.email, users);

  if (!userCheck) {

    res.status(403).send("User with email cannot be found");

  } else if (userCheck && userCheck.password !== req.body.password) {

    res.status(403).send("Incorrect password");

  } else {

    res.cookie("user_id", userCheck.id);
    res.redirect("/urls");

  }
})

app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});