/* Deployment settings. `backend` is the Apps Script web-app URL of the teacher's Unbound Ledger (see backend/Code.gs). Leave empty to play offline. */
var LORE_CONFIG = {
  backend: 'https://script.google.com/macros/s/AKfycbyyaVu9uDdLgZgEvYMt5qWpihWBEgoc82GvhbgN2dpx2WoaTjusM1g5M7ITsj6C3yPUNw/exec',
  // the web app is open to Anyone (it runs as the teacher, writes to the teacher's sheet, and only accepts the class codes listed in the ledger)
  backendNeedsLogin: false, schoolName: 'Rocky View Schools'
};
