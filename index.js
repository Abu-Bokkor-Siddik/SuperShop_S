const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = 3000;
require("dotenv").config();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
// verify jwt middleware
const jwtVerify = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.send({ message: "No token" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (err, decoded) => {
    if (err) {
      return res.send({ message: "invalid token" });
    }
    req.decoded = decoded;
    next();
  });
};

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
    const database = client.db("SiddikShope");
    const userInfoCollection = database.collection("users");
    const productInfoCollection = database.collection("products");
    // post user insert
    app.post("/users", async (req, res) => {
      try {
        const body = req.body;
        // have any user
        const query = { email: body?.email };
        const existingUser = await userInfoCollection.findOne(query);
        if (existingUser) {
          return res.send({ massage: "User already exist" });
        }
        const result = await userInfoCollection.insertOne(body);
        res.send(result);
        // console.log(body);
      } catch (err) {
        console.log(err);
      }
    });
    // get singel user
    app.get("/user/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await userInfoCollection.findOne(query);
      // console.log(result,'here ')
      res.send(result);
    });
    // add products
    app.post("/addProduct", jwtVerify, async (req, res) => {
      const productInfo = req.body;
      const result = await productInfoCollection.insertOne(productInfo);
      res.send(result);
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

    // app.get("/add", async (req, res) => {
    //   const alladd = haiku.find();
    //   const result = await alladd.toArray();
    //   res.send(result);
    // });
    // get all data
    app.get("/all", async (req, res) => {
      const { title, sort, category, brand } = req.query;
      const query = {};
    
      if (title) {
        query.title = { $regex: title, $options: "i" }; // Fixed typo: $option -> $options
      }
      if (category) {
        query.category = { $regex: category, $options: "i" }; // Fixed typo: $option -> $options
      }
      if (brand) {
        query.brand = brand;
      }
    
      const sortOption = sort === "asc" ? 1 : -1;
    
      try {
        const result = await productInfoCollection
          .find(query)
          .sort({ price: sortOption }) // Corrected $price to price
          .toArray();
          const totalProducts= await productInfoCollection.countDocuments(query);
          const productBrand= await productInfoCollection.find({},{projection:{category:1,brand:1}}).toArray()
          const brands = [...new Set(productBrand.map((p)=>p.brand))];
          const categorys = [...new Set(productBrand.map((p)=>p.category))];
    
        res.send({result,brands,categorys,totalProducts});
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
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
