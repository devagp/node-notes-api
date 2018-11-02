const expect = require("expect");
const request = require("supertest");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require("./../models/user");
const { ObjectID } = require("mongodb");
const { todos, populateTodos, users, populateUsers } = require("./seed/seed");

beforeEach(populateTodos);
beforeEach(populateUsers);

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
            expect(todo).toNotExist();
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

describe("PATCH /todos/:id", () => {
  it("Should update todo", done => {
    hexID = todos[0]._id.toHexString();
    text = todos[0].text + " hello";
    request(app)
      .patch(`/todos/${hexID}`)
      .send({ completed: true, text })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
      })
      .end(done);
  });
  it("Should clear completed at when todo is not completed", done => {
    hexID = todos[1]._id.toHexString();
    text = todos[1].text + " Hi";
    request(app)
      .patch(`/todos/${hexID}`)
      .send({ completed: false, text })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create user", done => {
    var email = "example@example.com";
    var password = "123mnb!";

    request(app)
      .post("/user")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email }).then(res => {
          // expect(res.password).toNotEqual(password);
          done();
        });
      });
  });

  it("should return validation error if request is invalid", done => {
    var email = "and";
    var password = "123";

    request(app)
      .post("/user")
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it("should not create user if email is already registered", done => {
    request(app)
      .post("/user")
      .send({ email: users[0].email, password: "Password@123" })
      .expect(400)
      .end(done);
  });
});

describe("POST /users/login", () => {
  it("should login user and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });

  it("should reject invalid login", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: "123456"
      })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });
});

describe("DELETE /users/me/token", () => {
  it("should delete their auth tokens", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
