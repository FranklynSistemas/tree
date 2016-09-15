var Stream = require('stream').Stream;
var mongoose = require('mongoose');
var UsuariosApp = require('../../schemas/usuarioApp');
var datos = require('../../schemas/schemas');
var Actividades = require('../../schemas/actividades');
var Departamentos = require('../../schemas/departamentos'); 

//Envio de correos
var sendgrid = require('sendgrid')('');


exports.ultimosDatos = function(req, res) { 

    // output json
    res.contentType('json');

    // use our lame formatter
    var format = new ArrayFormatter;

    datos.find().sort({"FechaSave":-1}).limit(1000).stream().pipe(format).pipe(res);
    
}

exports.DatosSegunConsulta = function(req, res) { 
	 // output json
    res.contentType('json');

    // use our lame formatter
    var format = new ArrayFormatter;
   
    console.log(req.body.id);
	UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, data){
			console.log(err, data);
	      if (err){
	         console.log("Error general "+err);
	      }else{
		console.log(creaQuery(data.Actividad,data.Departamento));
		datos.find(creaQuery(data.Actividad,data.Departamento)).sort({"FechaSave":-1}).limit(100).stream().pipe(format).pipe(res);     
	      }
	});
    //console.log(res.end().data);
    //return res.end();
}

//Actualiza las actividades, departamentos y las notificaciones===================================

exports.ActualizaDatos = function(req,res){
  var datosAux = req.body.datos;
  datos.count(creaQuery(datosAux.Actividad,datosAux.Departamento),function(err,cont){
    datosAux.NumeroRegistros = cont;
    UsuariosApp.update({"_id" : mongoose.Types.ObjectId(req.body.id)},datosAux,{upsert:true},function(err,numAffected){
                console.log(numAffected);
                if(numAffected){
                  res.json({status:true});
                }else{
                  res.json({status:false});
                }
    });
  });    
}

//================================================================================================

//Trae Departamentos y Actividades presentes en la configuracion del usuario
exports.TraePreferencias = function(req,res){

  var info = {};
  
  UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, data){
    info.Notificaciones = data.Notificaciones;
    info.ArrayActividades = data.Actividad;
    info.ArrayDepartamentos = data.Departamento; 
   if(!err){
      Departamentos.find({'id': {$in: data.Departamento}},function(errDep, dataDep){
        info.Departamentos = dataDep;
        //console.log(dataDep);
        if(!errDep){
          Actividades.find({'id' : { $in:data.Actividad}},function(errAct,dataAct){
            if(!errAct){
              info.Actividades = dataAct;
              //console.log(dataAct);
              res.json(info);
            }else{
              res.json({status: false});
            }
          });
        }else{
          res.json({status: false});
        }
      });
      
    }else{
      res.json({status: false});
    }

  });
}

//Guarda los porcesos favoritos del usuario
exports.GuardaFavoritos = function(req,res){
  UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, data){
    if(!err){
      var objFavoritos = AddFavoritos(req.body.favorito,data.Favoritos,res);
      if(objFavoritos.idx === -1 && req.body.action === 1){        
           ActualizaFavoritos(mongoose.Types.ObjectId(req.body.id),objFavoritos.data, function(obj){
              res.json(obj);
           });
      }else if(req.body.action === 2){
           ActualizaFavoritos(mongoose.Types.ObjectId(req.body.id),objFavoritos.data, function(obj){
              res.json(obj);
           });
      }else{
        res.json({status:false, info: "Existe"});
      }
    }

  });
}

function AddFavoritos(newFavorito,favoritos) {
  idx = favoritos.indexOf(newFavorito);
  if(idx===-1){
      favoritos.push(mongoose.Types.ObjectId(newFavorito));
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

//-----------------------------------------------------------------------------------------------------



//Trae los porcesos favoritos del usuario 

exports.TraeFavoritos = function(req, res) { 
   // output json
    res.contentType('json');

    // use our lame formatter
    var format = new ArrayFormatter;
    console.log(req.body.id);
  UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, data){
        if (err){
           console.log("Error general "+err);
        }else{ 
          if(data.Favoritos.length > 0){ 
            datos.find({"_id" : { $in: data.Favoritos }}).sort({"FechaSave":-1}).limit(100).stream().pipe(format).pipe(res);
          }else{
            res.json({status: false, info: "NoData"});
          }
        }
  });
}

//-----------------------------------------

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
                   '<h4>Usuario: <b>'+data.Usuario+'</b> </h4><h4>Contraseña: <b>'+data.Pass+'</b></h4><p>Te invitamos a acceder a nuestra aplicación, digitar tu usuario y contraseña, Si tienes alguna duda, sugerencia o reclamación por favor comunicarte con nuestra Línea de Servicio Telefónico o Ingresando a la pestaña <b>Contáctenos</b>.</p> <p> Cordial Saludo <p><b> INPRIX </b>';
            envioCorreos(Correo,info,function(status){
              res.json(status);
            });
        }else{
            res.json({status: false});
        }
        
  });
}
//------------------------------------------------------------------------------------------


function creaQuery(Actividad,Departamento){

  console.log(Actividad.length+" - "+Departamento.length);
  if(Actividad.indexOf(0) === -1 && Departamento.indexOf(0) === -1){

    if(Actividad.length > 0 && Departamento.length > 0){
    return {'Actividad' : { $in: Actividad }, 'Departamento' : {$in: Departamento }};
    }else if(Actividad.length > 0 && Departamento.length === 0){
      return {'Actividad': { $in: Actividad }};
    }else if(Actividad.length === 0 && Departamento.length > 0){
      return {'Departamento': {$in:  Departamento }};
    }else if(Actividad.length === 0 && Departamento.length === 0){
      return {};
    }

  }else if(Actividad.indexOf(0) === -1){
    return {'Actividad': { $in: Actividad }};
  }else if(Departamento.indexOf(0) === -1){
    return {'Departamento': {$in:  Departamento }};
  }else{
    return {};
  }
	

}

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
  from:     'informacion@inprix.co',
  subject:  'Inprix',
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
