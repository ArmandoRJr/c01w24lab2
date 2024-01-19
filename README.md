# <span style="color:#ADD8E6">Creating your first MERN App - Part 1</span>

<div align="right"> </div>

## <span style="color:#ADD8E6">Table of Contents </span>

- [Description](#desc)
- [Prerequisites](#pre)
- [Implementing the App](#impl)
  - [Database](#db)
  - [Backend](#bcknd)
- [Your Task](#task)
- [Frontend](#frntnd)

<a id="desc"></a>

## <span style="color:#ADD8E6"> Description </span>

This is a two part lab where you will learn how to build a simple full stack web application using MERN stack (MongoDB, ExpressJS, React.js, and Node.js) and you will build upon this application. Here's a brief overview of all the technologies you will explore in this lab.

### MongoDB

MongoDB is a NoSQL database that stores data in flexible, JSON-like documents, providing scalability and ease of development for applications with varied and evolving data structures. We will use Mongo as our database.

### Express.js

Express.js is a minimal and flexible Node.js web application framework that simplifies the creation of robust APIs and web applications, offering a range of features for routing, middleware, and HTTP utility methods.

### React.js

React.js is a declarative and efficient JavaScript library for building user interfaces, allowing developers to create reusable UI components and efficiently update the view as data changes. React Native is only a subset of React targeted toward building mobile/cross-platform applications as we saw in Lab 1. We will use React for our frontend.

### Node.js

Node.js is a server-side JavaScript runtime, enabling the execution of JavaScript code on the server, facilitating the development of scalable and high-performance network applications. We will use Node for our backend.

### Postman

Postman is a widely-used collaboration platform that simplifies the process of developing, testing, and documenting APIs. It provides a user-friendly interface for sending HTTP requests, inspecting responses, and managing API development workflows, making it a valuable tool for developers and teams working on API-related tasks.

Please refer to the officials docs and API references for more information:

- https://react.dev/reference/react
- https://nodejs.org/docs/latest/api/
- https://expressjs.com/en/4x/api.html
- https://www.mongodb.com/docs/

If there are any issues or inaccuracies, please contribute by raising issues, making pull requests, or asking on Piazza. Thanks!

In this part of the lab we will focus on writing a WebAPI from scratch in Node using the Express.js framework and storing our data in a local MongoDB database. We will learn to test our API using an HTTP client such as Postman.

<a id="pre"></a>

## <span style="color:#ADD8E6"> Prerequisites </span>

1. Make sure you have Node.js installed.
   You can install from the official website: https://nodejs.org/en/download/
2. We will be using a local Mongo database, refer to this link to set up your database: https://www.prisma.io/dataguide/mongodb/setting-up-a-local-mongodb-database#setting-up-mongodb-on-windows
3. An HTTP client to craft HTTP requests. We will use Postman. You can download Postman here: https://www.postman.com/downloads/
4. An IDE. We will use VS Code.

<a id="impl"></a>

## <span style="color:#ADD8E6"> Implementing the App </span>

Initialize a new GitHub repo named appropriately, and clone it locally. Navigate to the root of your project and create a new directory named `backend`. We will only work inside backend in this lab. Run `cd backend` to navigate to the backend directory.

<a id="db"></a>

### <span style="color:#ADD8E6"> Database </span>

See step 2 above for setting up a Mongo server locally. Once setup you should have a running MongoDB instance on localhost port 27017.

<a id="bcknd"></a>

### <span style="color:#ADD8E6"> Backend </span>

1. Navigate to the the `backend` directory inside your project and run `npm init`. For the entrypoint option enter: `server.js` and press enter to select the default option for everything else:
   ![Alt text](/images/1.png)
   `server.js` will be the entrypoint file for our backend application. Now should see a `package.json` file created. Open this file in an IDE and add the following line under `"scripts"`:

   ```js
   "start": "node server.js"
   ```

   This will the start script for our app, i.e. running `npm start` in this directory should run this script.

2. Now within your terminal while you're in the backend directory run: `npm install express mongodb cors`. These are the dependencies we are going to need to write our backend server.
3. Next open up the `server.js` in your preferred IDE and add the following imports:

```js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
```

`express` imports the `Express.js` framework from the `express` package. `MongoClient` is the database interaction client we will use to interact with our Mongo database in Node. `cors` imports the cors middleware from the `cors`` package. CORS stands for Cross-Origin Resource Sharing, and it is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page.

4. Now we will initialize our Express app and connect to our database. Firstly ensure your local Mongo instance is running on port 27017 by running `mongo` on your terminal. Now add the following lines to your `server.js`:

```js
const app = express();
const PORT = process.env.PORT || 4000;
const mongoURL = "mongodb://localhost:27017";
const dbName = "quirknotes";
```

and

```js
// Connect to MongoDB
let db;

async function connectToMongo() {
  const client = new MongoClient(mongoURL);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongo();
```

In the first chunk of code we initialize a new express app and store in the `app` variable for reference. We read the `PORT` from our `.env` file (if exists) otherwise assign it to 4000. And the database name we want to connect to is `quirknotes`.

The second chunk of code uses the MongoClient object along with the URL defined (local instance running on port 27017) to connect to our database.

5. Now add the following to enable `cors` for our app.

```js
// Enable CORS
app.use(cors());
```

6. And initialize a variable for a new sample collection within our database:

```js
// Define a sample MongoDB collection
const sampleCollection = "notes";
```

7. Now we will define the first endpoint for our app. This endpoint will add a new note from our databases' notes collection, add the following code to your `server.js`:

```js
// Create a sample document in the collection
app.post("/postNote", express.json(), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Title and content are both required!" });
    }

    const collection = db.collection(sampleCollection);
    const result = await collection.insertOne({ title, content });

    res.json({
      message: "Sample data added succesfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

The chunk of code defines an Express POST endpoint for adding some data to our database. The `req` variable contains the information contained in the request such as the `req.body` usually in JSON format. This endpoint requires the body of the request to contain at least two values named `"title"` and `"content"`. Next we use the `collection` variable to insert this new note into our collection (A "note" is defined as an object containing a title and some content):

```js
const collection = db.collection(sampleCollection);
const result = await collection.insertOne({ title, content });
```

Finally we send back a response as a JSON with a success message and the id of the inserted note.

8. Now we will define the second endpoint for our app. This endpoint will fetch all notes from our database notes collection and return it as a JSON array. Now add this chunk of code your `server.js`.

This endpoint is accessible at the route `/postNote` or our server.

```js
// Define a route to fetch data from the collection
app.get("/getNotes", async (req, res) => {
  try {
    const collection = db.collection(sampleCollection);
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

This piece of code defines an Express GET endpoint for fetching some data from our database. The `req` variable contains the information contained in the request such as the `req.body` usually in JSON format. We use the `db` variable defined earlier to access the `sampleCollection` we created and fetch all data in the form of an Array within this collection using this line:

```js
const data = await collection.find().toArray();
```

Finally we send back this data as a JSON object through the `res` variable. This endpoint is accessible at the route `/getNotes` of our server.

9. And that's all for defining endpoints, now all we have left to do is run our app on the port defined earlier. Add this line to the end of your `server.js`:

```js
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

9. And that's all! You can now run `npm start` under your backend directory to run your server.js. You should see the following output:

![output](/images/2.png)

This means that our server is now up and running on localhost port 4000.

10. Finally lets test our two endpoints by crafting an HTTP request in Postman and hitting the routes we defined. Firstly we will add a new note to our collection. Launch Postman and open a new tab as you see the Overview. You should see the following window where you can create a new HTTP request:

![Postman1](/images/3.png)

Now change the request type to `POST` and enter the following URL in the textbox: `http://localhost:4000/postNote`. Now navigate to the "Body" tab and select "raw" as well "JSON" from the little dropdown:

![Postman2](/images/4.png)

Now in the body textbox enter some JSON data with a title and some content. For e.g:

```JSON
{
  "title": "C01 <3",
  "content": "We luv Armando"
}
```

Finally hit send. If all goes well, you should receive a response back from the server similar to this:

```JSON
{
  "message":"Sample data added successfully",
  "insertedId":"65a9d6beecb49d7297f8e1ec"
}
```

This means that our note was successfully added to our database.

Now lets test our GET endpoint to make sure the data was actually added to the database. Change the request type to `GET` and the URL to `http://localhost:4000/getNotes`. A request body is not required for a `GET` request. Send the request and we should receive a JSON back containing only the note we added earlier:

![Postman3](/images/5.png)

And that's all, you now have a functioning API with the ability to add and fetch data from.

<a id="task"></a>

## <span style="color:#ADD8E6"> Your Task </span>

Your task in this lab is to build upon this application by adding two additional endpoints to your server:

- a PATCH endpoint at `/editNote` to edit an existing note given the id.
- a DELETE endpoint at `/deleteNote` to delete an existing note given the id.

<a id="next"></a>

## <span style="color:#ADD8E6"> What's Next </span>

Up to this point we have a functioning backend with the ability to store data persistently. In the next lab we will build upon this application by introducing a frontend (in React) and combining the 3 layers together in this "client-server architecture" with the ability perform CRUD operations through our frontend and view this changes in action.
