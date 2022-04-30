const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9bf1d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

  await client.connect();
  const productsCollection=client.db('CarAccessories').collection('parts');
  const likedItemsCollection = client.db('LikedItems').collection('items')

   try{
    app.get('/products', async(req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray()
      res.send(result);
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

    //// Visitor loved item
    app.post('/items', async(req, res) => {
      const newItem = req.body;
      const result = await likedItemsCollection.insertOne(newItem);
      res.send(result);
    })

    app.get('/items', async(req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = likedItemsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //item deletion
    app.delete('/items/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await likedItemsCollection.deleteOne(query);
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