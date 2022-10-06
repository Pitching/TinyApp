const lookupEmail = function (emailExist, users) {

  for (const userID in users) {
    if (users[userID].email === emailExist) {
      return users[userID];
    }
  }

  return null;
}

module.exports = lookupEmail;