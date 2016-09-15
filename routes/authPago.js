
var UsuariosApp = require('../schemas/usuarioApp');
var service = require('./service');
var pagos = require('./Utilidades/pagos');


//Envio de Correos
var sendgrid = require('sendgrid')('');
var fechas = require('./Utilidades/fechaColombia');
var mongoose = require('mongoose');



exports.emailSignup = function(req, res) {  
    var datos = req.body;
        //datos.Fecha = fechas.GeneraFechaIniFinal(1);
        //datos.Activo = true;
        //datos.NumSesiones = 0;
	UsuariosApp.count(function(err, cont){
		UsuariosApp.findOne({Usuario: datos.Usuario},function (err, status) {
	      if (err){
	         console.log("Error general");
	      }else if(!status){
	      		pagos.Registro(datos).then(function(response){
                console.log(datos);
		var datosAux = mapeoDatos(datos,cont,response);
    var formatfechas = fechasPlan({ini:response.currentPeriodStart,fin:response.currentPeriodEnd});
                usuario =  new UsuariosApp(datosAux);
                usuario.save(function (err, obj) {
                 if (!err) 
                    console.log(obj.Nombres + ' ha sido guardado');
                    var Mensaje = '<h1> Bienvenid@ a Inprix </h1> <br> <p>Ahora podrá saber de antemano cuando se cree un nuevo proceso en el Secop.'+
                                  '</p><p>Recuerde que su usuario y contraseña son: <br><b>Usuario: </b>'+obj.Usuario+'<br><b>Contraseña: </b>'+obj.Pass+'</p>'+
                                  '<br><p>El plan elegido fue: <b>'+response.plan.planCode+'</b>'+
                                  '<br>El periodo de prueba termina: (DD/MM/YYY) - '+formatfechas.fechaInicial+
                                  '<br>El plan termina: (DD/MM/YYY)- '+formatfechas.fechaFinal+
                                  '<br><p>Inprix, Correo: informacion@inprix.co</p>';
                    envioCorreos(obj.Correo,Mensaje);
                    res.status(200).send({token: service.createToken(obj),status:true});
                    //res.render('Administracion/Usuarios',{Nombre: req.session.VariableSession.Nombres});
                 });
            },function(err){
              res.status(200).send({status:false,info:"ErrorPayU"});
            });
	      }else{
	         console.log("El dato ya existe");	         
           res.status(200).send({status:false,info:"ExisteUsuario"});
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
    UsuariosApp.findOne({Usuario: req.body.Usuario}, function(err, user) {        
        if(user){
          if(user.Pass === req.body.Pass && user.Activo === true && user.NumSesiones <= 0){
            UsuariosApp.update({Usuario: req.body.Usuario},{NumSesiones:1,Token_Device: req.body.DeviceToken},{upsert:true},function(err, numAfectados){
              return res
              .status(200)
              .send({status: true,token: service.createToken(user)});
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
  from:     'informacion@inprix.co',
  subject:  'Inprix',
  html:      datos
}, function(err, json) {
  if (err) { return console.error(err); }
  console.log(json);
});

}

function mapeoDatos(data,cont, response){
   
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

function fechasPlan(unix){
  var datefechas = {Inicial : new Date(unix.ini), Final: new Date(unix.fin)};
  return  { fechaInicial: datefechas.Inicial.getDate()+'/'+eval(datefechas.Inicial.getMonth()+1)+'/'+datefechas.Inicial.getFullYear(),
            fechaFinal: datefechas.Final.getDate()+'/'+eval(datefechas.Final.getMonth()+1)+'/'+datefechas.Final.getFullYear()
          };
}