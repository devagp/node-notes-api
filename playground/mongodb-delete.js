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

    //delete many
    // db.collection("Todos")
    //   .deleteMany({ text: "Eat something" })
    //   .then(result => {
    //     console.log(result);
    //   });

    //delete one
    // db.collection("Todos")
    //   .deleteOne({ text: "Balck hawk" })
    //   .then(result => {
    //     console.log(result);
    //   });

    //find and delete one
    db.collection("Users")
      .findOneAndDelete({ _id: new ObjectID("5bd6ed8002aa941747177e3c") })
      .then(result => {
        console.log(result);
      });

    client.close();
  }
);
