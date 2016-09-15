var mongoose = require('mongoose');
var planes = require('../../schemas/planes');
var Usuarios = require('../../schemas/usuarioApp');
var https = https = require('https');
var Q = require('q');
var request = require('request');

var url = "/payments-api/rest/v4.3/";

var options = {
  hostname: 'api.payulatam.com',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  "Accept": "application/json",
                  "Accept-language": "es",
                  "Authorization" : "Basic ZkdkOUZ4UjdJS083OGg3OjFZTUtUOUFjMHlQbGd2YzAxMm81RWpGWVRx"
               }  
};

exports.TraePlanes = function(req, res) { 
    planes.find({},function(err, data){
    	if(data){
    		res.json({status:true,data:data});
    	}else{
    		res.json({status:false,data:null});
    	}
    });
}

exports.Subscribir = function(req,res){
	creaSubcripcion(req.body).then(function(response){
		res.json(response);
	},function(err){
		res.json(err);
	});
}

exports.Registro = function(data){
  var deferred = Q.defer();
  creaSubcripcion(data).then(function(response){
    deferred.resolve(response);
  },function(err){
    deferred.reject({status : false});
  });
  return deferred.promise;
}

var CreaCliente = function(data){
	var deferred = Q.defer();
	var reqAux = options;
        reqAux.path = url+"customers";
        var post_data = JSON.stringify({fullName : data.Nombres, email : data.Correo});
        console.log(post_data);       
    var request = https.request(reqAux, function (response) {
      console.log("CreaCliente: "+response.statusCode);
  		if (response.statusCode != 201) {
       deferred.reject({status : false});
		  }
      response.on('data', function (chunk) {
        var datos = chunk;
          console.log('Response: ' + chunk);
          deferred.resolve(JSON.parse(chunk));
      });
	   });
    request.write(post_data);
    request.end();
	return deferred.promise;
}

var CreaTarjeta = function(data){
	var deferred = Q.defer();
	CreaCliente(data).then(function(result){
		var reqCreteTarjeta = options;
        reqCreteTarjeta.path = url+"customers/"+result.id+"/creditCards";
        var post_data  = JSON.stringify({
                                   "name": data.Nombres,
                                   "document": data.Documento,
                                   "number": data.NumTarjeta,
                                   "expMonth": data.Mes,
                                   "expYear": data.Year,
                                   "type": data.TipoTarjeta.toUpperCase()
                                });
        var request = https.request(reqCreteTarjeta, function (response) {
        console.log("CreaTarjeta: "+response.statusCode);
	  		 if (response.statusCode != 201) {
				  deferred.reject({status : false});
			   }
        response.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          deferred.resolve({id:result.id,token: JSON.parse(chunk).token});
        }); 
		  });
       request.write(post_data);
	     request.end();
	},function(err){
		deferred.reject({status : false});
	});
	return deferred.promise;
}

var creaSubcripcion = function(data){
	var deferred = Q.defer();
	CreaTarjeta(data).then(function(respuesta){
		var creaSuscripcion = options;
        creaSuscripcion.path = url+"subscriptions/";
        var post_data  = JSON.stringify({
                                   "quantity": "1",
                                   "installments": "1",
                                   "trialDays": "30",
                                   "customer": {
                                      "id": respuesta.id,
                                      "creditCards": [
                                         {
                                            "token": respuesta.token
                                         }
                                      ]
                                   },
                                   "plan": {
                                      "planCode": data.Plan
                                   }
                                });
        var request = https.request(creaSuscripcion, function (response) {
        console.log("creaSuscripcion: "+response.statusCode);
	  		 if (response.statusCode != 201) {
				    deferred.reject({status : false});
			     }
          response.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          deferred.resolve(JSON.parse(chunk));
        });
		});
    request.write(post_data);    
    request.end();    
	},function(err){
		deferred.reject({status: true, data: err});
	})
	return deferred.promise;
}

exports.TraeInfoSuscripcion = function(req,res){
  Usuarios.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)},function(err,data){
    if(data){
      planes.findOne({planCode: data.Suscripcion.plan},function(err,datos){
        console.log(datos);
        if(datos){
          res.json({status:true, data:  {
                                          Plan: datos,
                                          User: data
                                        }
        });
        }else{
          res.json({status:false, info: "NoPlan"});
        }
      })
    }else{
      res.json({status:false, info: "NoData"});
    }
  });
}

exports.CancelarSuscripcion = function(req,res){
  var auxReq = options;
      auxReq.method = "DELETE";
   Usuarios.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)},function(err,data){
    if(data){
      auxReq.path = "/payments-api/rest/v4.3/subscriptions/"+data.Suscripcion.id;
        var request =  https.request(auxReq, function (response) {
          console.log(response.statusCode);
        if (response.statusCode === 200) {
          Usuarios.update({"_id" : mongoose.Types.ObjectId(req.body.id)},{Activo: false},{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  res.json({status:true, info:"SuscripcionEliminada"});
                }else{
                  res.json({status:false, info:"Error de base de datos"});
                }
          });
        }else{
          res.json({status:false, info:"errPayU"});
        }
      });
      request.end();
    }else{
      res.json({status:false, info: "NoData"});
    }
  });
}


exports.ModificarPlan = function(req,res){

 Usuarios.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)},function(err,data){ 
  if(data){
    console.log(data.Suscripcion);
    var auxReq = options;
        auxReq.method = "DELETE";
        auxReq.path = "/payments-api/rest/v4.3/subscriptions/"+data.Suscripcion.id;
    var request =  https.request(auxReq, function (response) {
          console.log(response.statusCode);
        if (response.statusCode === 200) {
            var creaSuscrip = options;
            creaSuscrip.method = "POST";
            creaSuscrip.path = "/payments-api/rest/v4.3/subscriptions/";
            var post_data  = JSON.stringify({
                                   "quantity": "1",
                                   "installments": "1",
                                   "trialDays": "0",
                                   "customer": {
                                      "id": data.Suscripcion.customerId,
                                      "creditCards": [
                                         {
                                            "token": data.Suscripcion.CreditCard
                                         }
                                      ]
                                   },
                                   "plan": {
                                      "planCode": req.body.Plan
                                   }
                                });
        var Actualizar = false;
        console.log(creaSuscrip);
        var request = https.request(creaSuscrip, function (response) {
        console.log("creaSuscripcion: "+response.statusCode);
         if (response.statusCode != 201) {
            res.json({status : false,info: "ErrorPayU"});
           }else{
            Actualizar = true;
           }
          response.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          var datos = JSON.parse(chunk);
          if(Actualizar){
             var query = {
                            Suscripcion: {
                                            customerId : data.Suscripcion.customerId,
                                            CreditCard : data.Suscripcion.CreditCard,
                                            plan : req.body.Plan,
                                            id : datos.id
                            },
                            Fecha: {FechaInicio: datos.currentPeriodStart, FechaFinal: datos.currentPeriodEnd}
                      }
            Usuarios.update({"_id" : mongoose.Types.ObjectId(req.body.id)},query,{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  res.json({status:true, info:"Plan Modificado"});
                }else{
                  res.json({status:false, info:"Error de base de datos"});
                }
            });
          }
         
        });
    });
        request.write(post_data);    
        request.end(); 
        }else{
          res.json({status:false, info:"errPayU"});
        }
      });
      request.end();
   
  }else{
    res.json({status:false, info: "NoData"});
  }
    
 });
}

exports.RenovarPlan = function(req,res){
  Usuarios.findOne({"Usuario" : req.body.Usuario, "Pass":req.body.Pass},function(err,data){ 
    if(data){
      var creaSuscrip = options;
            creaSuscrip.method = "POST";
            creaSuscrip.path = "/payments-api/rest/v4.3/subscriptions/";
            var post_data  = JSON.stringify({
                                   "quantity": "1",
                                   "installments": "1",
                                   "trialDays": "0",
                                   "customer": {
                                      "id": data.Suscripcion.customerId,
                                      "creditCards": [
                                         {
                                            "token": data.Suscripcion.CreditCard
                                         }
                                      ]
                                   },
                                   "plan": {
                                      "planCode": req.body.Plan
                                   }
                                });
        var Actualizar = false;
        var request = https.request(creaSuscrip, function (response) {
        console.log("creaSuscripcion: "+response.statusCode);
         if (response.statusCode != 201) {
            res.json({status : false,info: "ErrorPayU"});
           }else{
            Actualizar = true;
           }
          response.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          var datos = JSON.parse(chunk);
          if(Actualizar){
             var query = {
                            Suscripcion: {
                                            customerId : data.Suscripcion.customerId,
                                            CreditCard : data.Suscripcion.CreditCard,
                                            plan : req.body.Plan,
                                            id : datos.id
                            },
                            Fecha: {FechaInicio: datos.currentPeriodStart, FechaFinal: datos.currentPeriodEnd},
                            Activo: true
                      }
            Usuarios.update({"_id" : mongoose.Types.ObjectId(data._id)},query,{upsert:true},function(Error,numAffected){
                console.log(numAffected);
                if(numAffected){
                  res.json({status:true, info:"Renovado"});
                }else{
                  res.json({status:false, info:"Error de base de datos"});
                }
            });
          }
         
        });
    });
        request.write(post_data);    
        request.end(); 
    }else{
      res.json({status:false, info: "NoData"});
    }
  });
}


