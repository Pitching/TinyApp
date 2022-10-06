const lookUpEmail = function (email, users) {

  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID].id;
    }
  }

  return null;
}

const cookieCheck = function(cookie, users) {
  for (const eachUser in users) {
    if (cookie === eachUser) {
      return true;
    }
  }
  return false;
};

function generateRandomString() {
  let r = Math.random().toString(36).slice(2, 8);
  return r;

}

function generateRandomUserID(users) {
  let r;
  do {
    r = Math.random().toString(16).slice(2);
  } while (users.r);
  return r;
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

module.exports = { lookUpEmail, cookieCheck, generateRandomString, generateRandomUserID, urlsForUser };