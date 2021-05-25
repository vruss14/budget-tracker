const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;

    const objectStore = db.createObjectStore("Transactions");
    objectStore.createIndex("Deposit", "Deposit");
    objectStore.createIndex("Expense", "Expense");
  };
  
request.onsuccess = event => {
  console.log(request.result);
};