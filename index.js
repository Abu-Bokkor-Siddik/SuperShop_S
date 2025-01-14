const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = 3000;
require("dotenv").config();
// app.use(cors({}));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(cors({ origin: true, credentials: true }));
const { MongoClient, ServerApiVersion } = require("mongodb");
// mongo
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.kkqbu90.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // const haiku = database.collection("item");
    const database = client.db("SiddikShope");
    const userInfoCollection = database.collection("users");
    const productInfoCollection = database.collection("products");
    // post user insert
    app.post("/users", async (req, res) => {
      try {
        const body = req.body;
        // have any user 
        const query = {email:body?.email}
        const existingUser = await userInfoCollection.findOne(query)
        if (existingUser) {
          return res.send({massage:"User already exist"})
        }
        const result = await userInfoCollection.insertOne(body);
        res.send(result);
        // console.log(body);
      } catch (err) {
        console.log(err);
      }
    });

    // jwt
    app.post("/authentication", async (req, res) => {
      const userEmail = req.body;
      console.log(userEmail);
      const token = jwt.sign(userEmail, process.env.ACCESS_KEY_TOKEN, {
        expiresIn: "10d",
      });
      res.send({ token });
    });
    // get

    app.get("/add", async (req, res) => {
      const alladd = haiku.find();
      const result = await alladd.toArray();
      res.send(result);
    });

    // delete
    app.delete("/my/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await haiku.deleteOne(query);
      res.send(result);
    });
    // update data form submited data
    // app.put('/submits/:id',async(req,res)=>{
    //   const id = req.params.id
    //   const filter = {_id :new ObjectId(id)}
    //   const options ={ upset:true}
    // const updateDs= req.body
    // const updateds ={
    //   $set:{

    //     mark:updateDs.mark,
    //     note:updateDs.note,
    //     stutas:updateDs.stutas,
    //     textarea:updateDs.textarea

    //   }

    // }
    // const result = await submitedData.updateOne(filter,updateds,options)
    // res.send(result)
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
dbConnect();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
