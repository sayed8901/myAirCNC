const express = require("express");
const app = express();
const cors = require("cors");

const morgan = require("morgan");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const nodemailer = require('nodemailer');

const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);


// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mq0mae1.mongodb.net/?retryWrites=true&w=majority`

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebwgrc3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// validate JWT
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access attempted!" });
  }

  const token = authorization.split(" ")[1];
  console.log(token);

  // token verify
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access attempted!" });
    }

    req.decoded = decoded;
    next();
  });
};


// send email function
const sendEmail = (emailData, emailAddress) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASS_KEY,
    }
  });

  const mailOptions = {
    from: process.env.GMAIL,
    to: emailAddress,
    subject: emailData.subject,
    html: `<p>${emailData?.message}</p>`,
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
   console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      // do something useful
    }
  });
}



async function run() {
  try {
    const usersCollection = client.db("aircncDb").collection("users");
    const roomsCollection = client.db("aircncDb").collection("rooms");
    const bookingsCollection = client.db("aircncDb").collection("bookings");

    // generate client secret
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const { price } = req.body;
      console.log(price);
      if (price) {
        const amount = parseFloat(price) * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      }
    });

    // generate jwt token
    app.post("/jwt", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      // console.log(token);
      res.send({ token });
    });

    // save user name & role in DB
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      // console.log(result);
      res.send(result);
    });

    // get user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get all rooms
    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    // get all rooms for host
    app.get("/rooms/:email", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.params.email;
      if (decodedEmail !== email) {
        return res
          .status(403)
          .send({ error: true, message: "forbidden access attempted!" });
      }
      const query = { "host.email": email };
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });

    // get a single room
    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    // save roomData in database
    app.post("/rooms", async (req, res) => {
      const room = req.body;
      // console.log(room);
      const result = await roomsCollection.insertOne(room);
      res.send(result);
    });

    // update a room in database
    app.put('/rooms/:id', verifyJWT, async (req, res) => {
      const room = req.body
      console.log(room)

      const filter = { _id: new ObjectId(req.params.id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: room,
      }
      const result = await roomsCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    // update room booking status
    app.patch("/rooms/status/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          booked: status,
        },
      };
      const result = await roomsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //  Delete a room
    app.delete("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.deleteOne(query);
      res.send(result);
    });

    // get bookings for guest
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { "guest.email": email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    // get bookings for host
    app.get("/bookings/host", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { host: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    // save booking in database
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const result = await bookingsCollection.insertOne(booking);

      // send confirmation email to quest email address
      sendEmail({
        subject: 'Booking Successful!',
        message: `Booking Id: ${result.insertedId}, TransactionId: ${result.transactionId}`
      },
      booking?.guest?.email
      );

      // send confirmation email to host email address
      sendEmail({
        subject: 'Your room got booked!',
        message: `Booking Id: ${result.insertedId}, TransactionId: ${result.transactionId}`
      },
      booking?.host
      )

      res.send(result);
    });


    //  Delete a booking
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

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
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("AirCNC Server is running..");
});

app.listen(port, () => {
  console.log(`AirCNC is running on port ${port}`);
});
