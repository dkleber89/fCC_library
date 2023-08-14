/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { Client } = require("pg");

module.exports = function (app) {
  const client = new Client({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
  });

  client.connect();

  app
    .route("/api/books")

    .get(async function (_req, res) {
      const selectResponse = await client.query(
        "SELECT books._id, title, count(comment) as commentcount FROM books LEFT JOIN comments ON books._id=comments.book_id GROUP BY books._id"
      );

      res.json(
        selectResponse.rows.map((row) => ({
          ...row,
          commentcount: parseInt(row.commentcount),
        }))
      );
    })

    .post(async function (req, res) {
      let title = req.body.title;

      if (!title) {
        res.type("text").send("missing required field title");

        return;
      }

      await client.query("INSERT INTO books(title) VALUES($1)", [title]);

      const selectResponse = await client.query(
        "SELECT * FROM books WHERE title=$1",
        [title]
      );

      res.json(selectResponse.rows[selectResponse.rows.length - 1]);
    })

    .delete(async function (_req, res) {
      await client.query("TRUNCATE comments, books;");

      res.type("text").send("complete delete successful");
    });

  app
    .route("/api/books/:id")

    .get(async function (req, res) {
      let bookid = req.params.id;

      try {
        const response = await client.query(
          "SELECT books._id, title, array_agg(comment) as comments FROM books LEFT JOIN comments ON books._id=comments.book_id WHERE books._id=$1 GROUP BY books._id",
          [bookid]
        );

        if (response.rows.length >= 1) {
          res.json(
            response.rows.map((row) => ({
              ...row,
              comments: row.comments.filter((comment) => comment !== null),
            }))[0]
          );
        } else {
          res.type("text").send("no book exists");
        }
      } catch {
        res.type("text").send("no book exists");
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        res.type("text").send("missing required field comment");

        return;
      }

      try {
        const searchBookResponse = await client.query(
          "SELECT _id FROM books WHERE _id=$1",
          [bookid]
        );

        if (searchBookResponse.rows.length <= 0) {
          res.type("text").send("no book exists");

          return;
        }

        await client.query(
          "INSERT INTO comments(book_id, comment) VALUES($1, $2)",
          [searchBookResponse.rows[0]._id, comment]
        );

        const bookResponse = await client.query(
          "SELECT books._id, title, array_agg(comment) as comments FROM books LEFT JOIN comments ON books._id=comments.book_id WHERE books._id=$1 GROUP BY books._id",
          [bookid]
        );

        res.json(bookResponse.rows[0]);
      } catch {
        res.type("text").send("no book exists");
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;

      try {
        await client.query("DELETE FROM comments WHERE book_id=$1", [bookid]);

        const deletebooksResponse = await client.query(
          "DELETE FROM books WHERE _id=$1",
          [bookid]
        );

        if (deletebooksResponse.rowCount >= 1) {
          res.type("text").send("delete successful");

          return;
        }

        res.type("text").send("no book exists");
      } catch {
        res.type("text").send("no book exists");
      }
    });
};
