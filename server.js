const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Setup static content folder
app.use(express.static("public"));
// Add support for incoming JSON entities
app.use(bodyParser.json());
// Add support for CORS
app.use(cors());

const manager = require("./manager.js");
const m = manager();

// This handles a situation where the requestor sends
// a URL for a specific resource within the app
// The resource will not exist here at the server,
// because it exists only in the client device AFTER
// the Angular app is loaded
// So... handle all requests for anything other than the root
app.get('*', function (req, res) {
  console.log('Redirect was triggered');
  res.sendFile(__dirname + '/public/index.html');
});

app.get("/api", (req, res) => {
  const links = [];
  links.push({ "rel": "collection", "href": "/api/termEnglish", "methods": "GET" });
  links.push({ "rel": "collection", "href": "/api/termNonEnglish", "methods": "GET" });
  links.push({ "rel": "collection", "href": "/api/termDefinitions", "methods": "GET" });

  const linkObject = {
    "apiName": "a2-web-api",
    "apiDescription": "Web API with associated or related data",
    "apiVersion": "1.0",
    "apiAuthor": "Daniel Derich",
    "links": links
  };
  res.json(linkObject);
});

// ENGLISH TERMS -----------------------------------------------------------------------------
// 1. get all (sorted)
app.get("/terms/english", (req, res) => {
  m.TermsEnglishGetAll()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({ "message": error });
    })
});

// 2. get one, by object identifier
app.get("/terms/english/:id", (req, res) => {
  m.TermsEnglishGetOneById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ "message": "Resource not found : /terms/english/:id" });
    })
});

// 3. get one (or some), by “wordEnglish”
app.get("/terms/english/word/:text", (req, res) => {
  m.TermsEnglishGetByWordEnglish(req.params.text)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ "message": "Resource not found : /terms/english/:text" });
    })
});

// 4. add new (termEnglish document, including one definition embedded subdocument)
app.post("/terms/english", (req, res) => {
  m.TermsEnglishAdd(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({ "message": error });
    })
});

// 5. edit existing (termEnglish document), to add a new definition
app.put("/terms/english/:id/add-definition", (req, res) => {
  m.TermsEnglishEditAddDefinition(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    })
});

// 6. edit existing (termEnglish document), to increment the “helpYes” value
app.put("/terms/english/helpyes/:id", (req, res) => {
  m.TermsEnglishHelpYes(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    })
});

// 7. edit existing (termEnglish document), to increment the “helpNo” value
app.put("/terms/english/helpno/:id", (req, res) => {
  m.TermsEnglishHelpNo(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    })
});

// 8. edit existing (definition document), to increment the “likes” value
app.put("/terms/english/definition-like/:id", (req, res) => {
  m.TermsEnglishDefinitionIncrementLikes(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    });
});



// NON-ENGLISH TERMS --------------------------------------------------------------------------       
// 1. get all (sorted)
app.get("/terms/other", (req, res) => {
  m.TermsNonEnglishGetAll()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({ "message": error });
    })
});

// 2. get one, by object identifier
app.get("/terms/other/:id", (req, res) => {
  m.TermsNonEnglishGetOneById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ "message": "Resource not found : /terms/other/:id" });
    })
});

// 3. get one (or some), by “wordNonEnglish”
app.get("/terms/other/word/:text", (req, res) => {
  m.TermsNonEnglishGetByWord(req.params.text)
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.status(404).json({ "message": "Resource not found : /terms/other/:text" });
    })
});

// 4. add new (termNonEnglish document, including one definition embedded subdocument)
app.post("/terms/other", (req, res) => {
  m.NonEnglishAdd(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({ "message": error });
    }) // OOOOOOOOOOOOOOOOOOOOOOOOO
});

// 5. edit existing (termNonEnglish document), to add a new definition
app.put("/terms/other/:id/add-definition", (req, res) => {
  m.NonEnglishEditAddDefinition(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    }) // TOOOOOOOOOOOOOOOOOOOOOO
});



// 6. edit existing (termNonEnglish document), to increment the “helpYes” value
app.put("/terms/other/helpyes/:id", (req, res) => {
  m.TermsNonEnglishHelpYes(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    })
});

// 7. edit existing (termNonEnglish document), to increment the “helpNo” value
app.put("/terms/other/helpno/:id", (req, res) => {
  m.TermsNonEnglishHelpNo(req.params.id, req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    })
});

// 8. edit existing (definition document), to increment the “likes” value
app.put("/terms/other/definition-like/:id", (req, res) => {
  m.TermsNonEnglishDefinitionIncrementLikes(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(404).json({ "message": error });
    });
});


// ################################################################################
// Resource not found (this should be at the end)
app.use((req, res) => {
  res.status(404).send("Resource not found");
});
// ################################################################################
// Attempt to connect to the database, and
// tell the app to start listening for requests

m.connect().then(() => {
  app.listen(HTTP_PORT, () => { console.log("Ready to handle requests on port " + HTTP_PORT) });
})
  .catch((err) => {
    console.log("Unable to start the server:\n" + err);
    process.exit();
  });