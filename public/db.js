let db;
let budgetVersion;

// Requests to create a database for the application in IndexedDB
// The version is either the budgetVersion or 13
const request = indexedDB.open('BudgetDB', budgetVersion || 13);

request.onupgradeneeded = function (event) {
  console.log('IndexedDB needs to be updated.');

  // Updates the version number based on event info
  const { oldVersion } = event;
  const newVersion = event.newVersion || db.version;

  console.log(`The database has been updated from version ${oldVersion} to ${newVersion}`);

  db = event.target.result;

  if (db.objectStoreNames.length === 0) {

    // This object store is viewable within the BudgetDB in DevTools
    db.createObjectStore('BudgetStorage', { autoIncrement: true });
  }
};
  
request.onsuccess = event => {
  console.log(request.result);
};