var definitionSchema = require('./msc-definition.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var termNonEnglishSchema = new Schema({
    wordEnglish: { type: String, required: true },
    wordNonEnglish: String,
    wordExpanded: String,
    languageCode: { type: String, required: true },
    image: String,
    imageType: String,
    audio: String,
    audioType: String,
    linkAuthoritative: String,
    linkWikipedia: String,
    linkYouTube: String,
    authorName: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    dateRevised: { type: Date, required: true },
    fieldOfStudy: String,
    helpYes: {
        type: Number, default: 0
    },
    helpNo: {
        type: Number, default: 0
    },
    definitions: [definitionSchema],
    termEnglishId:{ type: mongoose.Types.ObjectId, required: true, ref: "TermsEnglish" } // added
});

module.exports = termNonEnglishSchema;