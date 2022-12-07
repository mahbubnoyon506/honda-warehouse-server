const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// function verifyJWT(req, res, next){
//   const authHeader = req.headers.authorization;
//   if(!authHeader){
//     return res.status(401).send({message: 'Unauthorized Access'})
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
//     if(err){
//       return res.status(403).send({message: 'Your access is forbidden'});
//     }
//     req.decoded = decoded;
//     // console.log('decoded', decoded);
//     next()
//   }) 
// }


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9bf1d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

  await client.connect();
  const productsCollection=client.db('CarAccessories').collection('parts');
  const likedItemsCollection = client.db('LikedItems').collection('items');
  const emailCollection = client.db('NewsEmail').collection('Emails')

   try{
    app.get('/products', async(req, res) => {
      const query = {};
      const limit = Number(req.query.limit);
      const pageNumber = Number(req.query.pageNumber)
      const cursor = productsCollection.find(query);
      const count = await productsCollection.estimatedDocumentCount()
      const result = await cursor.skip(limit*pageNumber).limit(limit).toArray()
      res.send({success: true, data: result, count});
    })
     
    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productsCollection.findOne(query);
      res.send(result);
    })

    app.post('/products', async(req, res) => {
      const newItem = req.body;
      const result = await productsCollection.insertOne(newItem);
      res.send(result); 
    })

    app.delete('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })

    //update 
    app.put('/products/:id', async(req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = {_id: ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          quantity: data.quantity, 
        }
      };
      const result = await productsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    })

    //// Visitor loved item
    app.post('/items', async(req, res) => {
      const newItem = req.body;
      const result = await likedItemsCollection.insertOne(newItem);
      res.send(result);
    })

    app.get('/items', async(req, res) => {
      // const decodedEmail = req.decoded.email;
      const email = req.query.email;
      // if(email === decodedEmail){
        const query = { email: email };
        const cursor = likedItemsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      // }
      // else{
      //   res.status(403).send({message: 'Your access is forbidden'})
      // }
    })

    //item deletion
    app.delete('/items/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await likedItemsCollection.deleteOne(query);
      res.send(result);
    })
  
    // Auth validation
    app.post('/login', async(req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: '1d'
      });
      res.send({accessToken});
    })

    //Newsletter info
    app.post('/newsletters', async(req, res) => {
      const newEmail = req.body;
      const result = await emailCollection.insertOne(newEmail);
      res.send(result);
    })

   }
   finally{

   }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Warehouse runnibg')
});

app.listen(port, () => {
    console.log('Server listening the port', port);
});

///////////////////////////////

