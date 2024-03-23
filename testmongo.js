const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://aaronmadison:aaronmdbpassword@aaronmdb.n8pvezz.mongodb.net/?retryWrites=true&w=majority&appName=aaronmdb";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const cookieParser = require('cookie-parser'); 
const app = express();
app.use(cookieParser());

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
  outstring += '<p><a href=\"./login\">Login</a>';
  outstring += '<p><a href=\"./register\">Register</a>';
  outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                              //T4-REF1
  res.send(outstring);
});

app.get('/register', function(req, res) {                                                  //T1-REF1
  var outstring = 'Login: ' + Date.now();
  //outstring += '<p><a href=\"';             //form to retrieve user input html style
  outstring += '<form action="./api/mongowrite/registerSubmit" method="GET"><p>Username: <input type="text" name="username"><p>Password: <input type="text" name="password"><p><input type="submit" name="Submit"></form>'
  outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                           //T4-REF2
  res.send(outstring);
});

app.get('/login', function(req, res) {                                                  //T1-REF1
  var outstring = 'Login: ' + Date.now();
  //outstring += '<p><a href=\"';             //form to retrieve user input html style
  outstring += '<form action="./api/mongo/loginSubmit" method="GET"><p>Username: <input type="text" name="username"><p>Password: <input type="text" name="password"><p><input type="submit" name="Submit"></form>'
  outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                          //T4-REF3
  res.send(outstring);
});


// Route to access database for people:
app.get('/api/mongo/loginSubmit', function(req, res) {
const client = new MongoClient(uri);
const searchKey = "{ username: '" + req.query.username + "' }";
console.log("Looking for: " + searchKey);

async function run() {
  try {
    const database = client.db('MyDBexample');
    const people = database.collection('MyAuthentication');

    // Hardwired Query for a part that has partID '12345'
    // const query = { partID: '12345' };
    // But we will use the parameter provided with the route
    //const query = { req.query.username: req.query.password };
    const query = { [req.query.username]: req.query.password };
    console.log(req.query.username)
    console.log(req.query.password)
    console.log(query)

    const person = await people.findOne(query);
    //console.log(person);

    if (person === null) {
      console.log("User not found")
      var outstring = 'User not found. Try again.'                                                            //T3.1-REF1
      outstring += '<p><a href=\"/\">Login again</a>';
      outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                                            //T4-REF5
      res.send(outstring);
    } else {
      console.log(person);
      console.log('setcookie');

      res.cookie('cook' + req.query.username + 'forlogin', req.query.username + 'cookie', {maxAge : 30000});                                   //T3.2-REF1

      var outstring = "Successfully logged in!"                                                               //T3.2-REF2
      outstring += '<p>Found this: ' + JSON.stringify(person)
      outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                                            //T4-REF6

      //res.send('Found this: ' + JSON.stringify(person));  //Use stringify to print a json
      res.send(outstring)
    }

    //res.send('Found this: ' + JSON.stringify(person));  //Use stringify to print a json

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
      var outstring = 'Got this: ' + JSON.stringify(doit);
      outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                          //T4-REF7
      res.send(outstring);  //Use stringify to print a json
  
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
  });

  app.get('/reportcookie', function (req, res) {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies);
  
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies);
  
    //Send the cookies report to the browser
    mycookies=req.cookies;
    res.send(JSON.stringify(mycookies) + " --Done reporting");
  });

  app.get('/clearcookie/:cookiename', function (req, res) {
    res.clearCookie(req.params.cookiename); //Shortcut for setting expiration in the past
    var outstring = "The cookie was cleared succesfully!"                                  //T3.2-REF2
    outstring += '<p><a href=\"/reportcookie\">See cookies</a>';                           //T4-REF8
    outstring += 'Cookie deleted' + req.params.cookiename;
    res.send(outstring);
  });