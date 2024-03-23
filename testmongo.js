const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://aaronmadison:aaronmdbpassword@aaronmdb.n8pvezz.mongodb.net/?retryWrites=true&w=majority&appName=aaronmdb";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
app.get('/', function(req, res) {
  const myquery = req.query;
  var outstring = 'Default endpoint starting on date: ' + Date.now();
  outstring += '<p><a href=\"./task1\">Login</a>';
  outstring += '<p><a href=\"./register\">Register</a>';
  res.send(outstring);
});

app.get('/register', function(req, res) {                                                  //T1-REF1
  var outstring = 'Login: ' + Date.now();
  //outstring += '<p><a href=\"';             //form to retrieve user input html style
  outstring += '<form action="./api/mongowrite/registerSubmit" method="GET"><p>Username: <input type="text" name="username"><p>Password: <input type="text" name="password"><p><input type="submit" name="Submit"></form>'

  res.send(outstring);
});

app.get('/say/:name', function(req, res) {
  res.send('Hello ' + req.params.name + '!');
});


// Route to access database:
app.get('/api/mongo/:item', function(req, res) {
const client = new MongoClient(uri);
const searchKey = "{ partID: '" + req.params.item + "' }";
console.log("Looking for: " + searchKey);

async function run() {
  try {
    const database = client.db('MyDBexample');
    const parts = database.collection('MyStuff');

    // Hardwired Query for a part that has partID '12345'
    // const query = { partID: '12345' };
    // But we will use the parameter provided with the route
    const query = { partID: req.params.item };

    const part = await parts.findOne(query);
    console.log(part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
});


app.get('/api/mongowrite/registerSubmit', function(req, res) {                              //T1-REF2
  console.log("PARAMS: inpkey: " + req.params.inpkey + " inpval: " + req.params.inpval);
  
  const client = new MongoClient(uri);
  
  // The following is the document to insert (made up with input parameters) :
  // First I make a document object using static fields
  const doc2insert = { 
    name: 'nam', 
    Description: 'desc', };
  // Additional fields using inputs:
    doc2insert[req.query.username]=req.query.password;
  
  console.log("Adding: " + doc2insert);
  console.log("Username: " + req.query.username)
  console.log("Password: " + req.query.password)
  
  async function run() {                                                                    //T2-REF1
    try {
      const database = client.db('MyDBexample');
      const where2put = database.collection('MyAuthentication');
  
      const doit = await where2put.insertOne(doc2insert);
      console.log(doit);
      res.send('Got this: ' + JSON.stringify(doit));  //Use stringify to print a json
  
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
  });
