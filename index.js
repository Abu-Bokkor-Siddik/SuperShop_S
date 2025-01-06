const express = require("express");
const app = express();

const cors = require("cors");
const port = 3000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion } = require("mongodb");
// mongo
const uri= `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.kkqbu90.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async()=> {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const haiku = database.collection("item");
    // get 
    app.get('/add',async(req,res)=>{
      const alladd = haiku.find()
      const result = await alladd.toArray()
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
dbConnect()
app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
