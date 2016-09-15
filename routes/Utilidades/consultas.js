var Stream = require('stream').Stream;
var mongoose = require('mongoose');
var UsuariosApp = require('../../schemas/usuarioApp');
var Rating = require('../../schemas/Rating');

//Envio de correos
var sendgrid = require('sendgrid')('');

var fechas = require('./fechaColombia');



exports.TraePefil = function(req, res) { 
  if(req.body.action != 0){
    UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, data){
       if(data){
        res.json({status:true, info: data});
       }else{
        res.json({status:false,info: "NoSeEncontroInfo"});
       }
    });

  }else{
    UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)},function(err,data){
    Rating.populate(data,{path:"Rating"},function(err,result){
      if(result){
        res.json({status:true,info:result});
      }else{
        res.json({status:false,info:err});
      }
    });
    
  });
  }
}


exports.ActualizaPefil= function(req,res){
  UsuariosApp.update({"_id" : req.body.id},req.body.actualizar,{upsert:true},function(err,numAffected){
              console.log(numAffected);
              if(numAffected){
                res.json({status: true});
              }else{
                res.json({status: false, info: "NoUpdate"});
              }
            });
}

exports.TraeCocheros = function(req, res) { 
    UsuariosApp.find({"Rol":"Vendedor"}, function(err, data){
       if(data){
        res.json({status:true, info: data});
       }else{
        res.json({status:false,info: "NoSeEncontroInfo"});
       }
    });
}


//Guarda los porcesos favoritos del usuario
exports.AgregarFavoritos = function(req,res){
  UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, data){
    if(!err){
      var objFavoritos = AddFavoritos(req.body.datos,data.Favoritos);
      if(objFavoritos.idx === -1 && req.body.action === 1){        
           ActualizaFavoritos(mongoose.Types.ObjectId(req.body.id),objFavoritos.data, function(obj){
              if(obj.status){
                replicaFavorito(req.body.id,req.body.datos,req.body.action, function(result){
                  res.json(result);
                });
              }else{
                res.json({status:false, info:"ErrorActualizandoFavoritos"});
              }
           });
      }else if(req.body.action === 2){
           ActualizaFavoritos(mongoose.Types.ObjectId(req.body.id),objFavoritos.data, function(obj){
              if(obj.status){
                replicaFavorito(req.body.id,req.body.datos,req.body.action, function(result){
                  res.json(result);
                });
              }else{
                res.json({status:false, info:"ErrorActualizandoFavoritos"});
              }
           });
      }else{
        res.json({status:false, info: "Existe"});
      }
    }

  });
}

function replicaFavorito(idCliente, idVendedor, Action, callback){
  UsuariosApp.findOne({"_id" : idVendedor}, function(err, data){
      if(!err){
        var objFavoritos = AddFavoritos(idCliente,data.Favoritos);
        if(objFavoritos.idx === -1 && Action === 1){        
             ActualizaFavoritos(idVendedor,objFavoritos.data, function(obj){
                callback(obj);
             });
        }else if(Action === 2){
             ActualizaFavoritos(idVendedor,objFavoritos.data, function(obj){
                callback(obj);
             });
        }else{
          callback({status:false, info: "Existe"});
        }
      }

    });
};

function AddFavoritos(newFavorito,favoritos) {
  var idx = favoritos.indexOf(newFavorito);
  console.log(idx);
  if(idx===-1){
      favoritos.push(newFavorito);
      return {idx: idx, data: favoritos};
  }else{
      favoritos.splice(idx,1);
      return {idx: idx, data: favoritos};
  }
}
//-----------------------------------------------------------------------------------------------------

//Actualiza Favoritos
function ActualizaFavoritos(id,favoritos, callback){
  UsuariosApp.update({"_id" : id},{Favoritos:favoritos},{upsert:true},function(err,numAffected){
              console.log(numAffected);
              if(numAffected){
                callback({status: true});
              }else{
                callback({status: false, info: "NoUpdate"});
              }
            });
}
//---------------------------------------------------------------------

exports.TraerFavoritos = function(req, res) { 
    UsuariosApp.findOne({"_id":req.body.id}, function(err, data){
       if(data){
        UsuariosApp.find({'_id': {$in: data.Favoritos}}, function(err, result){
          res.json({status:true, info: result});
        });
       }else{
        res.json({status:false,info: "NoSeEncontroInfo"});
       }
    });
}

function BuscaFavorito(newFavorito,favoritos) {
  var idx = favoritos.indexOf(newFavorito);
      favoritos.splice(idx,1);
      return {idx: idx, result: favoritos};
  }


exports.CreaComentario = function(req, res) { 
  UsuariosApp.findOne({"_id":req.body.id}, function(err, data){
    if(data.Rating === undefined){
      rating = new Rating([req.body.datos]);
        rating.save(function (err, obj) {
          if (!err){ 
            ActualizaUser({id:req.body.id, idRating: obj._id}, function(result){
                if(result.status){
                  obj.Rating.push(req.body.datos);
                  ActualizaRating({id:obj._id,Rating:obj.Rating}, function(result){
                    res.json(result);
                  });
                }else{
                  res.json(result);
                }
            });
          }else{
            res.json({status:false, info:"Error creando nuevo comentario"});
          }
        });
    }else{
      Rating.findOne({"_id":data.Rating}, function(err, resultado){
        resultado.Rating.push(req.body.datos);
        ActualizaRating({id:data.Rating,Rating:resultado.Rating}, function(result){
          res.json(result);
        });
      });
    }
  });
};

function ActualizaUser(data, callback){
  UsuariosApp.update({"_id" : data.id},{Rating:data.idRating},{upsert:true},function(err,numAffected){
              if(numAffected){
                callback({status: true});
              }else{
                callback({status: false, info: "NoUpdate"});
              }
  });
}

function ActualizaRating(data, callback){
  Rating.update({"_id" : data.id},{Rating:data.Rating},{upsert:true},function(err,numAffected){
              if(numAffected){
                callback({status: true});
              }else{
                callback({status: false, info: "NoUpdate"});
              }
  });
}

//Verifica que el correo exista en base de datos y de ser asi envia el usuario y contraseña
exports.RecuperarPass = function(req, res) { 
  var Correo = [];
  var info = '';
  UsuariosApp.findOne({"Correo" : req.body.Correo}, function(err, data){
        if (err){
           console.log("Error general "+err);
           res.json({status: false});
        }else if(data){ 
            Correo.push(data.Correo);
            info = '<h3>Apreciado (a) '+data.Nombres+'</h3><br><p>Te informamos que tu Usuario y Contraseña actuales son los siguientes: </p>'+
                   '<h4>Usuario: <b>'+data.Correo+'</b> </h4><h4>Contraseña: <b>'+data.Pass+'</b></h4><p>Te invitamos a acceder a nuestra aplicación, digitar tu usuario y contraseña, Si tienes alguna duda, sugerencia o reclamación por favor comunicarte con nuestra Línea de Servicio Telefónico (3003103924)</b>.</p> <p> Cordial Saludo <p><b> Red-Cocheros </b>';
            envioCorreos(Correo,info,function(status){
              res.json(status);
            });
        }else{
            res.json({status: false});
        }
        
  });
}
//------------------------------------------------------------------------------------------



function ArrayFormatter () {
  Stream.call(this);
  this.writable = true;
  this._done = false;
}

ArrayFormatter.prototype.__proto__ = Stream.prototype;

ArrayFormatter.prototype.write = function (doc) {
  if (! this._hasWritten) {
    this._hasWritten = true;

    // open an object literal / array string along with the doc
    this.emit('data', '{ "results": [' + JSON.stringify(doc) );

  } else {
    this.emit('data', ',' + JSON.stringify(doc));
  }

  return true;
}

ArrayFormatter.prototype.end =
ArrayFormatter.prototype.destroy = function () {
  if (this._done) return;
  this._done = true;

  // close the object literal / array
  this.emit('data', ']}');
  // done
  this.emit('end');
}

function envioCorreos(correos,datos,callback){
//var correos = ['franking.sistemas@gmail.com','flm@galavi.co', 'amvs@galavi.co'];
sendgrid.send({
  to:        correos,
  from:     'redcocheros@gmail.com',
  subject:  'Red-Cocheros',
  html:      datos
}, function(err, json) {
  if (err) {
    callback({status: false}); 
 }else{
    console.log(json);
    callback({status: true});
 }
  
});

}
