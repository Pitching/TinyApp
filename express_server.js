const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
})

app.post("/urls", (req, res) => {
  const ranString = generateRandomString(); // Generates a unique 6 character string that is assigned to the object and passed to the urls_show template
  urlDatabase[ranString] = req.body.longURL;
  const templateVars = { id: ranString, longURL: urlDatabase[ranString], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updateURL;
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  let UID = generateRandomUserID();

  if (!req.body.email || !req.body.password) {
    res.status(400).send("You shall not pass!!!");
  } else if (lookupEmail(req.body.email, users)) {
    res.status(400).send("user with email found");
  } else {
    users[UID] = { id: UID, email: req.body.email, password: req.body.password };
    res.cookie("user_id", UID);
    res.redirect("/urls");
  }
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});