const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express(); 
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v43qfla.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

      const toysCollection = client.db('babyCarsToy').collection('allToys');



      app.get("/allToy", async (req, res) => {
          const result = await toysCollection.estimatedDocumentCount();
          res.send({ result });
      });

      app.get("/allToys", async (req, res) => {
          const data = req.query;
          const category = data?.category;
          const search = req.query.search;

          let query = {};

          if (category) {
              query = { sub_category: category };
          }

          if (search) {
              query = { name: { $regex: search, $options: 'i' } }
          }


          // const page = parseInt(data.page) || 0;
          // const limit = parseInt(data.limit) || 20;
          // const skip = page * limit;

          const result = await toysCollection
              .find(query)
              .toArray();
          res.send(result);
      });

      app.get('/toy/:id', async (req, res) => {
          const id = req.params.id;
          console.log(id);
          const query = { _id: new ObjectId(id) };
          const result = await toysCollection.findOne(query);
          res.send(result)
      })


      app.get('/myToys', async (req, res) => {
          const Email = req.query?.Email;
          const sortData = req.query.sort;
          console.log(Email)

          let query = {}

          if (Email) {
              query = { Email: Email }
          }

          let sortQuery = {}

          if (sortData) {
              if (sortData === "asc") {
                  sortQuery = { price: 1 };
              } else if (sortData === "desc") {
                  sortQuery = { price: -1 };
              }
          }

          const result = await toysCollection.find(query).sort(sortQuery).toArray();
          res.send(result);
      })


      app.post('/allToys', async (req, res) => {
          const addToy = req.body;
          const result = await toysCollection.insertOne(addToy);
          res.send(result);
      });


      app.put('/myToys/:id', async (req, res) => {
          const id = req.params.id;
          const toy = req.body;

          const filter = { _id: new ObjectId(id) }

          const options = { upsert: true }

          const updatedToy = {
              $set: {
                  name: toy?.name,
                  photoUrl: toy?.photoUrl,
                  description: toy?.description,
                  price: toy?.price,
                  quantity: toy?.quantity,
                  rating: toy?.rating,
                  Category: toy?.Category,
              }
          }

          const result = await toysCollection.updateOne(filter, updatedToy, options)

          res.send(result)
      })

      app.delete('/myToys/:id', async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) }
          const result = await toysCollection.deleteOne(filter);
          res.send(result)
      })

      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("express is running....!")
})

app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`)
})