const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const { MongoClient } = require('mongodb');
require('dotenv').config()
// console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrqdf.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const port = 5000
const app = express()
app.use(cors());
app.use(bodyParser.json());



//import from firebase account

var serviceAccount = require("./configs/burj-al-arab-b9537-firebase-adminsdk-sovh0-9e2b9471b7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const pass = "ArabianHorse79"



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  //console.log("db connection successfully");

  app.post('/addBooking', (req,res)=>{ 
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result =>{
      // console.log(result);
      res.send(result.insertedCount > 0);
    })
    console.log(newBooking);
  })

  app.get('/bookings',(req,res)=>{
    const bearer = req.headers.authorization
    if(bearer && bearer.startsWith('Bearer ') ){

      const idToken = bearer.split(' ')[1];
     // console.log({idToken});
      // idToken comes from the client app
      admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken){
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
       // console.log(tokenEmail,queryEmail);


        if(tokenEmail == queryEmail){
          bookings.find({email:queryEmail})
    .toArray((err, document) =>{
      res.status(200).send(document);
    })
        }
        else{
          res.status(401).send('un-authorized access');
        }
        
      }).catch(function(error){
        res.status(401).send('un-authorized access');
      });

    }
    else{
      res.status(401).send('un-authorized access');
    }


  


    
  })
  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port);