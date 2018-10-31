const { ObjectID } = require("mongodb");

const { mongoose } = require("./../server/db/mongoose");
const { Todo } = require("./../server/models/todo");

var id = "5bd8345d367ed20c5fcf2841";

if (!ObjectID.isValid(id)) {
  console.log("ID is not valid");
}
// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log("Todos: ", todos);
// });

// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log("Todo: ", todo);
// });

// Todo.findById(id)
//   .then(todoById => {
//     console.log("Todo: ", todoById);
//   })
//   .catch(e => console.log(e));
