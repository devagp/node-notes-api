const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");
const { Todo } = require("./../../models/todo");
const { User } = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: "devang@gmail.com",
    password: "pass@word1",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: "auth" }, "abc123").toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "meow@gmail.com",
    password: "pass@word2",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userTwoId, access: "auth" }, "abc123").toString()
      }
    ]
  }
];

const todos = [
  {
    _id: new ObjectID(),
    text: "First todo",
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: "Second todo",
    completed: true,
    completedAt: 333,
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: "Third todo",
    _creator: userTwoId
  }
];

const populateUsers = done => {
  User.remove({})
    .then(() => {
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

const populateTodos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos).then(() => {
      done();
    });
  });
};

module.exports = { populateTodos, todos, populateUsers, users };
