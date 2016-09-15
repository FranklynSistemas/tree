var mongoose = require('mongoose');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var planesSchema = new Schema({
   id_Obj:ObjectId,
   id: Number,
   planCode: String,
   descripcion: String,
   valor: Number
});

module.exports = mongoose.model('planes', planesSchema);
