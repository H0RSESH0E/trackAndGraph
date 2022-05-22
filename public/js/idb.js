if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
let db;
// opens a new indexedDB database
const request = indexedDB.open('budget_tracker', 1);

// emission occurs when a version is created or changed
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    // creates an object store called new_budget
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function (event) {
    // the value of db is updated when a DOM event is type: success and target: request
    db = event.target.result;

    // check if online and send local db
    if (navigator.onLine) {

        uploadBudget();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 

    console.log('saving the record: ^^', record.name);
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to your store with add method
    budgetObjectStore.add(record);
}

function testIt(input){
    console.log('-- TEST IT', input);
}

function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_budget');
  
    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();
  
// upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_budget'], 'readwrite');
          // access the new_pizza object store
          const pizzaObjectStore = transaction.objectStore('new_budget');
          // clear all items in your store
          pizzaObjectStore.clear();

          alert('Back Online: budget data has been updated.');
          cycle()
        })
        .catch(err => {
          console.log(err);
        });
    }
  };  
}

window.addEventListener('online', uploadBudget);