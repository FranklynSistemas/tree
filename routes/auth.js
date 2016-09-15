
var UsuariosApp = require('../schemas/usuarioApp');
var service = require('./service');
var pagos = require('./Utilidades/pagos');


//Envio de Correos
var sendgrid = require('sendgrid')('');
var fechas = require('./Utilidades/fechaColombia');
var mongoose = require('mongoose');



exports.emailSignup = function(req, res) {  
  var datos = req.body;
	UsuariosApp.count(function(err, cont){
          UsuariosApp.findOne({Correo: datos.Correo},function (err, status) {
          		if (err){
                 console.log("Error general");
                 res.status(200).send({status:false, info:"ErrorInesperado"})
              }else if(!status){
                      var datosAux = mapeoDatos(datos,cont);
                          usuario =  new UsuariosApp(datosAux);
                          usuario.save(function (err, obj) {
                           if (!err){ 
                              console.log(obj.Nombres + ' ha sido guardado');
                              if(obj.Rol === "Vendedor"){
                                var Mensaje = '<h1> Bienvenid@ a Cocheros </h1> <br> <p>Ahora podrá mostrar su ubicación en el mapa como también sus horarios de apertura y cierre a todos sus clientes.'+
                                            '</p><p>Recuerde que su usuario y contraseña son: <br><b>Usuario: </b>'+obj.Correo+'<br><b>Contraseña: </b>'+obj.Pass+'</p>'+
                                            '<br><p>Red-Cocheros, Correo: RedCocheros@gmail.com</p>';
                              }else{
                                var Mensaje = '<h1> Bienvenid@ a Cocheros </h1> <br> <p>Ahora puede identificar el puesto de cocheros más proximó a su ubicación.'+
                                            '</p><p>Recuerde que su usuario y contraseña son: <br><b>Usuario: </b>'+obj.Correo+'<br><b>Contraseña: </b>'+obj.Pass+'</p>'+
                                            '<br><p>Red-Cocheros, Correo: RedCocheros@gmail.com</p>';
                              }
                              
                              envioCorreos(obj.Correo,Mensaje);
                              res.status(200).send({token: service.createToken(obj),status:true});
                           }else{
                              console.log(err);
                              res.status(200).send({status:false, info:"ErrorInesperado"});
                           }
                         });
                 }else{
                  res.status(200).send({status:false,info:"ExisteCorreo"});
                 }
            });
	      
	});
//-------------------------------------------------
  /*  var user = new UsuariosApp({
        // Creamos el usuario con los campos
        // que definamos en el Schema
        // nombre, email, etc...
    });

    user.save(function(err){
        return res
            .status(200)
            .send({token: service.createToken(user)});
    });

 */   
};

exports.emailLogin = function(req, res) {  
    UsuariosApp.findOne({Correo: req.body.Correo}, function(err, user) {        
        if(user){
          if(user.Pass === req.body.Pass && user.Activo === true && user.NumSesiones <= 0){
            UsuariosApp.update({Correo: req.body.Correo},{NumSesiones:1},{upsert:true},function(err, numAfectados){
              return res
              .status(200)
              .send({status: true,Rol:user.Rol,token: service.createToken(user)});
            });
          }else if(user.Pass !== req.body.Pass){
            res.json({status: false, info: "errPass"});
          }else if(user.Activo === false){
            res.json({status: false, info: "NoPago"});
          }else{
            res.json({status: false, info: "NoSesiones"});
          }
        }else{
        	res.json({status: false, info: "NoExiste"});
        }
        // Comprobar si hay errores
        // Si el usuario existe o no
        // Y si la contraseña es correcta
        
    });
};

exports.limpiaSesion = function(req,res){
console.log(req.body.id);
UsuariosApp.findOne({"_id" : mongoose.Types.ObjectId(req.body.id)}, function(err, user) { 
  UsuariosApp.update({"_id" : mongoose.Types.ObjectId(req.body.id)},{NumSesiones:user.NumSesiones-1,Token_Device:''},{upsert:true},function(err, numAfectados){
    if(numAfectados){res.json({status:true})}
  });
});
};

function envioCorreos(correos,datos){
//var correos = ['franking.sistemas@gmail.com','flm@galavi.co', 'amvs@galavi.co'];
sendgrid.send({
  to:       correos,
  from:     'RedCocheros@gmail.com',
  subject:  'Red-Cocheros',
  html:      datos
}, function(err, json) {
  if (err) { return console.error(err); }
  console.log(json);
});

}

function mapeoDatosPago(data,cont, response){
   
   return  { 
             id: cont++,
             Nombres: data.Nombres,
             Apellidos: data.Apellidos,
             Telefono: data.Telefono,
             Correo: data.Correo,
             Departamento: [0],
             Actividad : [0],
             Notificaciones: false,
             Usuario: data.Usuario,
             Pass: data.Pass,
             Favoritos: {ids: [], NumRegFavoritos: []},
             Token_Device: data.TokenDevice,
             NumeroRegistros: 0,
             Historial: [],
             Activo: true,
             NumSesiones: 0,
             Fecha : {FechaInicio: response.currentPeriodStart, FechaFinal: response.currentPeriodEnd},
             Suscripcion :  {
                                id: response.id,
                                plan: response.plan.planCode,
                                CreditCard: response.customer.creditCards[0].token,
                                customerId: response.customer.id
                            }
            };
}

function mapeoDatos(data,cont){
   
   return  { 
             id: cont++,
             Nombres: data.Nombre,
             Correo: data.Correo,
             Notificaciones: false,
             Pass: data.Pass,
             Token_Device: data.TokenDevice,
             Activo: true,
             NumSesiones: 0,
             Fecha : fechas.GeneraFechaIniFinal(3),
             Rol: data.rol,
             Domicilios: false,
             Abierto: false,
             Ubicacion: {},
             Favoritos: [],
             Foto: "",
             Hora:{ini:"",fin:""},
             Contacto:"",
             Estado:""
            };
}

function fechasPlan(unix){
  var datefechas = {Inicial : new Date(unix.ini), Final: new Date(unix.fin)};
  return  { fechaInicial: datefechas.Inicial.getDate()+'/'+eval(datefechas.Inicial.getMonth()+1)+'/'+datefechas.Inicial.getFullYear(),
            fechaFinal: datefechas.Final.getDate()+'/'+eval(datefechas.Final.getMonth()+1)+'/'+datefechas.Final.getFullYear()
          };
}