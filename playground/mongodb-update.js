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
      .findOneAndUpdate({ name: "Devang" }, { $inc: { age: 1 } })
      .then(res => {
        console.log(res);
      });

    client.close();
  }
);
