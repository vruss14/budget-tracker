let db;
let budgetVersion;

// Requests to create a database for the application in IndexedDB
// The version is either the budgetVersion or 13
const request = indexedDB.open('BudgetDB', budgetVersion || 13);

// Error handling
request.onerror = function (event) {
    console.log(`There has been an error in the IndexedDB request: ${event.target.errorCode}`)
}

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

function readIndexedDB() {
    console.log("Accessing the BudgetDB in IndexedDB");

    // Opens a transaction within the BudgetStorage in read/write mode
    let transaction = db.transaction(['BudgetStorage'], 'readwrite')

    // Accesses the specific BudgetStorage object
    const storageObject = transaction.objectStore('BudgetStorage');

    // Retrieves all records from storage
    const allRecords = storageObject.getAll();


    // If records were successfully retrieved from IndexedDB, then they will be sent to the server via a POST request
    allRecords.onsuccess = function() {
        
        if(allRecords.result.length > 0) {
            // This POST request will POST the records all together instead of one at a time when the user is online
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((response) => {
                // Checks to see if storage is empty; if not, a new transaction is created
                if (response.length !== 0) {
                    transaction = db.transaction(['BudgetStorage', 'readwrite']);

                    const currentStorage = transaction.objectStore('BudgetStorage');

                    // Clears the storage in IndexedDB after a successful POST request to the server
                    currentStorage.clear();
                    console.log("IndexedDB storage has been cleared.")
                }
            })
        }
    }
}
  
request.onsuccess = event => {
  console.log("The request was successful!");
  console.log(event.target.result);
  db = event.target.result;

  // Checks if the user is online while using the app; if so, it's a good time to POST any offline entries
  // from IndexedDB to the server
  if(navigator.onLine) {
      console.log("The app is online!");
      readIndexedDB();
  } else {
      console.log("The app is offline!");
  }
};

const saveRecord = function (record) {
    console.log("Saving the record created offline.");

    // Creates a transaction for the particular record
    const transaction = db.transaction(['BudgetStorage'], 'readwrite');

    // Accesses the objectStore
    const storage = transaction.objectStore('BudgetStorage');

    // Adds the record to IndexedDB
    storage.add(record);
}

window.addEventListener('online', readIndexedDB);
