const express = require('express')
const fs = require('fs')
const app = express()
const port = 8080
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbUrl = 'mongodb://127.0.0.1:27017';
const db_name = "BargainBin"
const db = new MongoClient(dbUrl);
const dbStories = db.db(db_name).collection('stories');
const dbCollections = db.db(db_name).collection('collections');
const dbAuthors = db.db(db_name).collection('authors');

/*
testing login data fetching in BargainBin database
json:
{
    name: {
        first: 'Donald',
        last: 'Trump'
    },
    user: 'DT',
    password: 'makeAmericaGr8Again'
}
*/

// runs the mongodb server `db`
// todo: make db stay connected.
/*
async function run() {
    try {      
      await db.connect();
      

    } finally {
      // Ensures that the client will close when you finish/error
      await db.close();
    }
}
run().catch(console.dir);
*/

async function addAuthor(authorJSON) {
  try {
    await db.connect();


  } finally {
    await db.close();
  }

  // cannot allow repeated username
  let query = {'user': authorJSON.user}
  let repeatedUsername = await dbAuthors.findOne(query) // returns a document with repeated user or null
  if (repeatedUsername != null) {
    console.log('username repeated');
    return null;
  }

  return dbAuthors.insertOne(authorJSON); // this is a Promise
}

app.get('/', (req, res) => {
  // serve login_form.html

  /*
  fs.readFile('templates/login_form.html').then(data => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  }).catch(err => {
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end('404 not found');
  })
  */

  fs.readFile('templates/login_form.html', (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    }
 
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  })
})

// in the front end, if you only mention <form action='/login'> and
// nothing else, then no data will be sent and the body will just
// be ''
// 
// that is because without a body-parser, req.body is always undefined.
// https://stackoverflow.com/questions/27237744/node-js-express-html-form-req-body-is-undefined
//

app.post('/login', (req, res) => {
  //let name = req.body.name;
  //let password = req.body.password;
  //console.log(`name: ${name}`);
  //console.log(`password: ${password}`);
  console.log(`body: ${req.body}`);
  return res.end('received login info');
})

app.post('/create_account', (req, res) => {
  // get json string from req
  let body = '';
  req.setEncoding('utf8'); // Get the data as utf8 strings
  req.on('error', err => {
    console.error(err);
  });
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    let newAuthor = JSON.parse(body);
    // mongodb handles json here
    addAuthor(newAuthor);
  });
})

app.listen(port, () => {
  console.log(`loginServer listening at http://localhost:${port}`);
})

