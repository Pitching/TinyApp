const lookUpEmail = function (email, users) {

  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID].id;
    }
  }

  return null;
}

module.exports = lookUpEmail;