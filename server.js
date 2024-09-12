const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
var uniqid = require("uniqid");

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Landing Page Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Notes HTML Route
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

// API Get Route
app.get("/api/notes", (req, res) => {
  // Using fs module, read the db.json file and return all saved notes as JSON
  fs.readFile("./db/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading notes");
    }

    res.json(JSON.parse(data));
  });
});

// Post Route
app.post("/api/notes", (req, res) => {
  // Grab new note on request body
  const newNote = req.body;
  // Implements the uniqid module to give each note a unique id
  newNote.id = uniqid();

  fs.readFile("./db/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading notes");
    }
    // Push the new note to the array
    const notes = JSON.parse(data);
    notes.push(newNote);

    // Update JSON file with new note
    fs.writeFile("./db/db.json", JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving note");
      }

      res.json(newNote);
    });
  });
});

// DELETE Route
app.delete("/api/notes/:id", (req, res) => {
  // Receives a query parameter containing the id of a note to delete
  const noteId = req.params.id;

  fs.readFile("./db/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading notes");
    }

    // Reads all notes and filters for note with given id
    let notes = JSON.parse(data);
    const updatedNotes = notes.filter((note) => note.id !== noteId);

    // Rewrites the notes to db.json
    fs.writeFile("./db/db.json", JSON.stringify(updatedNotes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error deleting note");
      }

      res.json({ message: "Note deleted successfully" });
    });
  });
});

// Wildcard Route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
