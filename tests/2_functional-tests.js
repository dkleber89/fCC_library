/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send({ title: "Fisch" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.typeOf(res.body._id, "string");
              assert.equal(res.body.title, "Fisch");

              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)    
            .keepOpen()
            .post("/api/books")
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");

              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "commentcount");
            assert.typeOf(res.body[0].commentcount, "number");
            assert.property(res.body[0], "title");
            assert.typeOf(res.body[0].title, "string");
            assert.property(res.body[0], "_id");
            assert.typeOf(res.body[0]._id, "string");

            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books/2134")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");

            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .end(function (err, res) {
            chai
              .request(server)
              .keepOpen()
              .get(`/api/books/${res.body[0]._id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body.comments);
                assert.property(res.body, "title");
                assert.property(res.body, "_id");

                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .keepOpen()
            .get("/api/books")
            .end(function (err, res) {
              chai
                .request(server)
                .keepOpen()
                .post(`/api/books/${res.body[0]._id}`)
                .send({ comment: "Comment Test" })
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.isArray(res.body.comments);
                  assert.equal(
                    res.body.comments[res.body.comments.length - 1],
                    "Comment Test"
                  );
                  assert.property(res.body, "title");
                  assert.property(res.body, "_id");

                  done();
                });
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post(`/api/books/1234`)
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field comment");

              done();
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post(`/api/books/1234`)
            .send({ comment: "Comment Test" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");

              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .end(function (err, res) {
            chai
              .request(server)
              .keepOpen()
              .delete(`/api/books/${res.body[0]._id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, "delete successful");

                done();
              });
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete("/api/books/1234")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");

            done();
          });
      });
    });
  });
});
