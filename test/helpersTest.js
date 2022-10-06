const { assert } = require('chai');

const { lookUpEmail, cookieCheck, urlsForUser } = require('../helpers');

const testUrlDatabase = {
  "ekd72w": {
    longURL: "http://youtube.com",
    userID: "userRandomID"
  },
  "1234fe": {
    longURL: "http://youtube2.com",
    userID: "userRandomID"
  },
  "w9eksa": {
    longUR: "http://google.com",
    userID: "user2RandomID"
  }
};

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

describe('getUserByEmail', function () {

  it('should return a user with valid email', function () {
    const user = lookUpEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if there are no users with the email found', function () {
    const user = lookUpEmail("unavailable@test.ca", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

});

describe('cookieCheck', function () {

  it('should return true if a user with valid id is found', function () {
    const user = cookieCheck("userRandomID", testUsers);
    const expectedUserID = true;
    assert.equal(user, expectedUserID);
  });

  it('should return false if there are no users with provided id', function () {
    const user = cookieCheck("unavailable@test.ca", testUsers);
    const expectedUserID = false;
    assert.equal(user, expectedUserID);
  });

});

describe('urlsForUser', function () {

  it('should return an object with the short and long url(s) for the user ID', function () {
    const sites = urlsForUser("userRandomID", testUrlDatabase);
    const expectedURL = {
      "ekd72w": "http://youtube.com",
      "1234fe": "http://youtube2.com"
    }
    assert.deepEqual(sites, expectedURL);
  });

  it('should return an empty object with for the user ID if no associated urls found', function () {
    const sites = urlsForUser("user3RandomID", testUrlDatabase);
    const expectedURL = {}
    assert.deepEqual(sites, expectedURL);
  });

});