// Setup
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var definitionSchema = new Schema({
    authorName: { type: String , required: true },
    dateCreated: { type: Date, required: true },
    definition: { type: String },
    quality: {type: Number, default: 0},
    likes: {type: Number, default: 0 }
});

module.exports = definitionSchema;