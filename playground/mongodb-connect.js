const { MongoClient, ObjectID } = require("mongodb");

var obj = new ObjectID();
console.log(obj);

MongoClient.connect(
  "mongodb://localhost:27017/TodoApp",
  (err, client) => {
    if (err) {
      return console.log("Unable to connect to mongodb server");
    }

    console.log("Connected to mongodb server");
    const db = client.db("TodoApp");

    db.collection("Todos")
      .find()
      .toArray()
      .then(docs => {
        console.log(JSON.stringify(docs, undefined, 2));
      });

    client.close();
  }
);
