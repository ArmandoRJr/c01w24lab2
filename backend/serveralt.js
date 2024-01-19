import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const app = express();
const PORT = 4000;
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

// 
const COLLECTIONS = {
    notes: "notes",
    users: "users"
}

// Register a new user
app.post('/registerUser', express.json(), async (req, res) => {
    try {
        const { username, password } = req.body; 
    
        // Basic body request check
        if (!username || !password) { 
            return res.status(400).json({error: "Username and password both needed to login."}) 
        }

        // Checking if username does not already exist in database
        const userCollection = db.collection(COLLECTIONS.users)
        const existingUser = await userCollection.findOne({username})
        if (existingUser) {
            return res.status(400).json({error: "Username already exists."})
        }

        // Creating hashed password (search up bcrypt online for more info)
        // and storing user info in database
        const hashedPassword = await bcrypt.hash(password, 10)
        await userCollection.insertOne({
            username,
            password: hashedPassword
        })

        // Returning JSON Web Token (search JWT for more explanation)
        const token = jwt.sign({ username }, 'secret-key', { expiresIn: '1h' });
        res.status(201).json({response: "User logged in successfully.", token})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

// Log in an existing user
app.get('/loginUser', express.json(), async (req, res) => {
    try {
        const { username, password } = req.body; 
    
        // Basic body request check
        if (!username || !password) { 
            return res.status(400).json({error: "Username and password both needed to login."}) 
        }

        // Find username in database
        const userCollection = db.collection(COLLECTIONS.users)
        const user = await userCollection.findOne({username})

        // Validate user against hashed password in database
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({username}, 'secret-key', {expiresIn: '1h'})

            // Send JSON Web Token to valid user
            res.json({response: "User registered succesfully.", token: token}) //Implicitly status 200
        } else {
            res.status(401).json({error: "Authentication failed."})
        }

    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

app.post('/postNote', express.json(), async (req, res) => {
    try {
        // Basic body request check
        const {title, content} = req.body;
        if (!title || !content) {
            return res.status(400).json({error: "Title and content are both required."})
        }

        // Verify the JWT from the request headers
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'secret-key', async (err, decoded) => {
            if (err) {
                return res.status(401).send('Unauthorized.')
            }
            
            // Send note to database
            const collection = db.collection(COLLECTIONS.notes) 
            const result = await collection.insertOne({title, content, username: decoded.username})
            res.json({message: "Note added succesfully.", insertedId: result.insertedId}) 
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

app.get('/getAllNotes', express.json(), async (req, res) => {
    try {
        // Verify the JWT from the request headers
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'secret-key', async (err, decoded) => {
            if (err) {
                return res.status(401).send('Unauthorized.')
            }
            
            // Get all notes belonging to the user
            // NOTE: User can have no notes; this does *not* count as an error...this time
            // but sometimes a 404 error might be helpful here :eyes:
            const collection = db.collection(COLLECTIONS.notes);
            const data = await collection.find({username: decoded.username}).toArray();
            res.json({response: data});
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

/*
    TODO: Develop 3 more endpoints
    NOTE: All three require proper authentication (i.e. usage of JWT)

    GET request - "/getNote"
        - Body: {_id: "id-here"}
        - Required status codes to implement:
            - 500 (General server errors)
            - 400 (Bad request in relation to the body parameters) 
            - 401 (Unauthorized)
            - 404 (Note with ID _id belonging to the user not found) [arguably the most challenging one]
            - 200 (Successful request)
                - The response body should look like:
                {
                    "response": {
                        "_id": "id-here"
                        "title": "Title here"
                        "content": "Content here"
                        "username": "UsernameHere"
                    }
                }
        - TA note: You shouldn't run into this to begin with, but
        users are, of course, only allowed to edit their own notes.
        If user A tries to edit user B's note X (let's say they somehow managed
        to get the _id Z of note X), user A shouldn't even be able to know of
        note X's existence, so it's ok to return 404 in this sort of scenario.

    DELETE request - "/deleteNote"
        - Body: {_id: "id-here"}
        - Required status codes to implement:
            - 500 (General server errors)
            - 400 (Bad request in relation to the body parameters) 
            - 401 (Unauthorized)
            - 404 (Note with ID _id belonging to the user not found) [arguably the most challenging one]
            - 200 (Successful request)
                - The response body should look like:
                {
                    "response": "Document properly deleted."
                }
                (Little barebones, I know.)

    PATCH request - "/patchNote"
        - Body: {_id: "id-here", "title": "Title here", content: "Content here"}
                - Note that for PATCH, you can partially update a document!
                - You can have just a title update, just a content update, or an update for both!
                - Please make sure to handle this correctly. I know you can do it.
        - Required status codes:
            - 500 (General server errors)
            - 400 (Bad request in relation to the body parameters) 
            - 401 (Unauthorized)
            - 404 (Note with ID _id not found) [arguably the most challenging one]
            - 200 (Successful request)
                - The response body should look like:
                {
                    "response": "Document properly updated."
                }
                (Also  barebones.)
*/



// Open Port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });