const ua = require('universal-analytics');
const { uuid } = require('uuidv4');
const Store = require('electron-store');
const tracker = new Store();

// Retrieve the userid value, and if it's not there, assign it a new uuid.
const userId = tracker.get('userid') || uuid();

// (re)save the userid, so it persists for the next app session.
tracker.set('userid', userId);

const usr = ua('UA-156049282-1', userId);

function trackEvent(category, action, label, value) {
  usr
    .event({
      ec: category,
      ea: action,
      el: label,
      ev: value,
    })
    .send();
}

module.exports = { trackEvent };