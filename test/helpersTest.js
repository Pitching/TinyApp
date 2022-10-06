const { assert } = require('chai');

const { lookUpEmail, cookieCheck, generateRandomString, generateRandomUserID, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = lookUpEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if there are no users with the email found', function() {
    const user = lookUpEmail("unavailable@test.ca", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

});