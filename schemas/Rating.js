var mongoose = require('mongoose');

var   Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

var ratingSchema = new Schema({
	id_Obj:ObjectId,
	Rating: [{
				Nombres: String,
				Fecha: String,
				Foto: String,
				rating: Object
			}]
});

module.exports = mongoose.model('rating', ratingSchema);
