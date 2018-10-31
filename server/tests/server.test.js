const expect = require("expect");
const request = require("supertest");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { ObjectID } = require("mongodb");

const todos = [
  {
    _id: new ObjectID(),
    text: "First todo"
  },
  {
    _id: new ObjectID(),
    text: "Second todo"
  },
  {
    _id: new ObjectID(),
    text: "Third todo"
  }
];

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos).then(() => {
      done();
    });
  });
});

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "Test todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });

  it("should not create todo with invalid data", done => {
    var text = "";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(3);
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });
});

describe("GET /todos", () => {
  it("Should get todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("Should get todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("Should return 404 if object not found", () => {
    var id = new ObjectID();
    request(app)
      .get(`/todos/${id}`)
      .expect(404);
  });

  it("Should return 404 for none object-ids", () => {
    var id = 123456;
    request(app)
      .get(`/todos/${id}`)
      .expect(404);
  });
});

describe("DELETE /todos/:id", () => {
  it("Should delete todo doc", done => {
    hexID = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(res.body.todo._id)
          .then(todo => {
            expect(todo).toBeNull();
            done();
          })
          .catch(e => {
            return done(e);
          });
      });
  });

  it("Should return 404 if todo not found", () => {
    var id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404);
  });

  it("Should return 404 for none object-ids", () => {
    var id = 123456;
    request(app)
      .delete(`/todos/${id}`)
      .expect(404);
  });
});
