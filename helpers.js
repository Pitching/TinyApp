// Function looks up the user ID by email, if there is a match return the user ID
// If there is no match return null
const lookUpEmail = function (email, users) {

  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID].id;
    }
  }

  return null;
};

// Function checks the active cookie if there is one on the client side
// If there is a cookie with a corresponding user in the database, return true
// Otherwise, return false
const cookieCheck = function (cookie, users) {
  for (const eachUser in users) {
    if (cookie === eachUser) {
      return true;
    }
  }
  return false;
};

// Function to generate a random 6 character short URL
// Function will keep looping if the sequence already exists in the database
// return the short URL at the end.
function generateRandomShortURL(urlDatabase) {
  let r;
  do {
    r = Math.random().toString(36).slice(2, 8);
  } while (urlDatabase.r);

  return r;
};

// Function to generate a random string for the user ID
// Function will keep looping if the sequence already exists in the database
// return the user ID at the end.
function generateRandomUserID(users) {
  let r;
  do {
    r = Math.random().toString(16).slice(2);
  } while (users.r);
  return r;
};

// Function will loop through the url Database with provided ID
// If match is found for the url, add it to a new matches object
// At the end, return the full matches object
const urlsForUser = function (id, urlDatabase) {
  let matches = {}

  for (let shortID in urlDatabase) {
    if (urlDatabase[shortID].userID === id) {
      matches[shortID] = urlDatabase[shortID].longURL;
    }
  }

  return matches;
};

module.exports = { lookUpEmail, cookieCheck, generateRandomShortURL, generateRandomUserID, urlsForUser };