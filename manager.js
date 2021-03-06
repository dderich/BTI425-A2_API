// Data service operations setup
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const DefSchema = require('./msc-definition.js');
const EnglishSchema = require('./msc-termEnglish.js');
const NonEnglishSchema = require('./msc-termNonEnglish.js');
module.exports = function () {
  let Definition;
  let English;
  let NonEnglish;
  //let Language;
  return {
    connect: function () {
      return new Promise(function (resolve, reject) {

        // Create connection to the database
        console.log('Attempting to connect to the database...');
        let db = mongoose.createConnection("mongodb+srv://danieldb:AfHVLL@bti425-vm6h6.mongodb.net/db-a2?retryWrites=true&w=majority",
          {
            connectTimeoutMS: 5000,
            useUnifiedTopology: true
          });

        db.on('error', (error) => {
          console.log('Connection error:', error.message);
          reject(error);
        });

        db.once('open', () => {
          console.log('Connection to the database was successful!');
          Definition = db.model("Definition", DefSchema);
          English = db.model("TermsEnglish", EnglishSchema, "TermsEnglish");
          NonEnglish = db.model("TermsOther", NonEnglishSchema, "TermsOther");
          resolve();
        });
      }); // Promise
    }, // connect

    // ENGLISH TERMS -----------------------------------------------------------------------------
    TermsEnglishGetAll: function () {
      return new Promise((resolve, reject) => {
        English.find()
          .sort({ wordEnglish: 'asc' })
          .exec((error, items) => {
            if (error) {
              return reject(error.message);
            }
            return resolve(items);
          });
      });
    },
    TermsEnglishGetOneById: function (termId) {
      let temporary = English.findById(termId);
      if (temporary) {
        return temporary;
      } else {
        throw "Not Found: TermsEnglishGetOneById";
      }
    },

    TermsEnglishGetByWordEnglish: async function (text) {
      // URL decode the incoming value
      text = decodeURIComponent(text);

      // Attempt to find in the "name" field, case-insensitive
      let results = await English.find({ wordEnglish: { $regex: text, $options: "i" } });
      // This will find zero or more
      if (!results) {
        throw "No matching word found";
      }
      return results;
    },

    TermsEnglishAdd: async function (newEngTerm) {
      let tempEnglishTerm = new English(newEngTerm);
      if (tempEnglishTerm) {
        await tempEnglishTerm.save();
        return tempEnglishTerm;
      } else {
        throw "English Term could not be added!";
      }
    },

    TermsEnglishEditAddDefinition: async function (termId, newDef) {
      let temporary = await English.findById(termId);
      if (temporary) {
        temporary.definitions.push(newDef);
        temporary.dateRevised = new Date();
        await temporary.save();
        return temporary;
      }
      else {
        throw "Not Found : TermsEnglishEditAddDefinition";
      }
    },

    TermsEnglishHelpYes: async function (termId, termBody) {
      // Early exit, confirm that the parameter and entity body match
      if (termId !== termBody._id) {
        throw "IDs do not match in HELP YES";
      }

      let tempTerm = await English.findById(termId);
      if (tempTerm) {
        tempTerm.helpYes++;
        tempTerm.dateRevised = new Date();
        await tempTerm.save();
        return tempTerm;
      } else {
        throw "Could not find that English Term: Help Yes";
      }
    },
    TermsEnglishHelpNo: async function (termId, termBody) {
      // Early exit, confirm that the parameter and entity body match
      if (termId !== termBody._id) {
        throw "IDs do not match in HELP NO";
      }

      let tempTerm = await English.findById(termId);
      if (tempTerm) {
        tempTerm.helpNo++;
        tempTerm.dateRevised = new Date();
        await tempTerm.save();
        return tempTerm;
      } else {
        throw "Could not find that English Term: Help Yes";
      }
    },


    TermsEnglishDefinitionIncrementLikes: async function (termId, definitionBody) {
      let temporary = await English.findById(termId);
      if (!temporary) {
        throw "English Term not found!";
      }
 
      let term = await English.findOne({ "definitions._id": definitionBody._id });
      if (term) {
        let def = term.definitions.id(definitionBody._id);
        def.likes++;
        await term.save();
        return term;
      } else {
        throw "Not found: TermsEnglishDefinitionIncrementLikes";
      }
    },

    // NON-ENGLISH TERMS --------------------------------------------------------------------------
    TermsNonEnglishGetAll: function () {
      return new Promise((resolve, reject) => {
        NonEnglish.find()
          .sort({ wordNonEnglish: 'asc' })
          .exec((error, items) => {
            if (error) {
              return reject(error.message);
            }
            return resolve(items);
          });
      });
    },

    TermsNonEnglishGetOneById: function (termId) {
      let temporary = NonEnglish.findById(termId);
      if (temporary) {
        return temporary;
      } else {
        throw "Not Found: TermNonEnglishGetOneById";
      }
    },

    // added for translation buttons
    TermsNonEnglishGetSomeByEnglishId: function (termId) {
      return new Promise(function (resolve, reject) {
        NonEnglish.find({ termEnglishId: termId })
          .exec((error, items) => {
            if (error) {
              return reject(error.message);
            }
            return resolve(items);
          });
      })
    },

    TermsNonEnglishGetByWord: async function (text) {
      // URL decode the incoming value
      text = decodeURIComponent(text);

      // Attempt to find in the "name" field, case-insensitive
      let results = await NonEnglish.find({ wordNonEnglish: { $regex: text, $options: "i" } });
      // This will find zero or more
      if (!results) {
        throw "No matching word found";
      }
      return results;
    },

    // 4. add new (termNonEnglish document, including one definition embedded subdocument)
    NonEnglishAdd: async function (newTerm) {
      let temporary = await English.findById(newTerm.termEnglishId);
      if (temporary) {
        let NonTerm = new NonEnglish(newTerm);
        if (NonTerm) {
          await NonTerm.save();
          return NonTerm;
        } else {
          throw "NON-English Term could not be added!";
        }
      } else {
        throw "No English term for that exists!";
      }
    },

    // 5. edit existing (termNonEnglish document), to add a new definition
    NonEnglishEditAddDefinition: async function (termId, newDef) {
      let temporary = await NonEnglish.findById(termId);
      if (temporary) {
        temporary.definitions.push(newDef);
        temporary.dateRevised = new Date();
        await temporary.save();
        return temporary;
      }
      else {
        throw "Not Found : TermsEnglishEditAddDefinition";
      }
    },

    // 6. increment Help Yes
    TermsNonEnglishHelpYes: async function (termId, termBody) { 
      if (termId !== termBody._id) {
        throw "IDs do not match in NON-English HELP YES";
      } // Early exit, confirm that the parameter and entity body match

      let tempTerm = await NonEnglish.findById(termId);
      if (tempTerm) {
        tempTerm.helpYes++;
        tempTerm.dateRevised = new Date();
        await tempTerm.save();
        return tempTerm;
      } else {
        throw "Could not find that NON-English Term: Help Yes";
      }
    },

    // 7. increment Help No
    TermsNonEnglishHelpNo: async function (termId, termBody) {
      // Early exit, confirm that the parameter and entity body match
      if (termId !== termBody._id) {
        throw "IDs do not match in NON-English HELP NO";
      }

      let tempTerm = await NonEnglish.findById(termId);
      if (tempTerm) {
        tempTerm.helpNo++;
        tempTerm.dateRevised = new Date();
        await tempTerm.save();
        return tempTerm;
      } else {
        throw "Could not find that NON-English Term: Help Yes";
      }
    },

    // 8. Increment Likes on Definition of term
    TermsNonEnglishDefinitionIncrementLikes: async function (nonEngId, definitionBody) {
      let temporaryTerm = await NonEnglish.findById(nonEngId);
      if (!temporaryTerm) {
        throw "NON-ENGLISH TERM NOT FOUND!";
      }

      let term = await NonEnglish.findOne({ "definitions._id": definitionBody._id });
      if (term)
      {
        let def = term.definitions.id(definitionBody._id);
        def.likes++;
        await term.save();
        return term;
      } else
      {
        throw "Not found: TermsNonEnglishDefinitionIncrementLikes";
      }
    }
  } // return
} // module.exports