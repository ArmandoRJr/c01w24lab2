import express from 'express';
import { MongoClient } from 'mongodb';
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 4000;
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'quirknotes';

// Connect to MongoDB
let db;

async function connectToMongo() {
  const client = new MongoClient(mongoURL);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongo();


// Define a sample MongoDB collection
const sampleCollection = 'notes';

// Enable CORS
app.use(cors())

// Define a route to fetch data from the collection
app.get('/getNotes', async (req, res) => {
    try {
      const collection = db.collection(sampleCollection);
      const data = await collection.find().toArray();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Create a sample document in the collection
app.post('/postNote', express.json(), async (req, res) => {
    try {
        const {title, content} = req.body;

        if (!title || !content) {
            return res.status(400).json({error: "Title and content are both required!"})
        }

        const collection = db.collection(sampleCollection)
        const result = await collection.insertOne({title, content})

        res.json({message: "Sample data added succesfully", insertedId: result.insertedId})

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });