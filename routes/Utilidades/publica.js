var mongoose = require('mongoose');
var UsuariosApp = require('../../schemas/usuarioApp');
var datos = require('../../schemas/schemas');
var noticias = require('../../schemas/noticias');
var categorias = require('../../schemas/categorias');
var userAdmin = require('../../schemas/userAdmin');


var fechas = require('./fechaColombia');


exports.TraeCategorias = function(req,res){
	categorias.find({},function(err,data){
		if(data){
			res.json({status:true,info:data});
		}else{
			res.json({status:false,info:err});
		}
	});
};

exports.TraeNoticias = function(req,res){
	noticias.find(req.body.categoria,function(err,data){
		categorias.populate(data,{path:"categoria"},function(err,result){
			if(result){
				res.json({status:true,info:result});
			}else{
				res.json({status:false,info:err});
			}
		});
		
	});
};

exports.TraeNoticia = function(req,res){
	noticias.findOne({_id:req.body.id},function(err,data){
		categorias.populate(data,{path:"categoria"},function(err,result){
			if(result){
				res.json({status:true,info:result});
			}else{
				res.json({status:false,info:err});
			}
		});
	});
};
exports.creaNoticia = function(req,res){
  var datosAux = req.body;
  noticias.count({categoria:req.body.categoria},function(err,cont){
  	datosAux.id = cont+1;
   noticia =  new noticias(datosAux);
                noticia.save(function (err, obj) {
                 if (!err){
                 	res.json({status:true,info:"Noticia creada correctamente"});
                 }else{
                 	res.json({status:false,info:err});
                 } 
                    
                 });
  });    
};

exports.editaNoticia = function(req,res){
  var datosAux = req.body.datos;
  noticias.update({"_id" : mongoose.Types.ObjectId(req.body.id)},datosAux,{upsert:true},function(err,numAffected){
                console.log(numAffected);
                if(numAffected){
                  res.json({status:true,info:"Noticia actualizada correctamente",id:req.body.id});
                }else{
                  res.json({status:false,info:"Error: "+err});
                }
    });
};

exports.eliminaNoticia = function(req,res){
 noticias.remove({_id: req.body.id}, function(error){
      if(error){
         res.json({status:false,info:'Error al intentar eliminar la noticia'});
      }else{ 
         res.json({status:true,info:'Noticia eliminada correctamente'});
      }
   });
};
//****************************************Usuarios*************************************************

exports.TraeUserAdmins = function(req,res){
	userAdmin.find({},function(err,data){
		if(data){
			res.json({status:true,info:data});
		}else{
			res.json({status:false,info:err});
		}
	});
};

exports.TraeUserAdmin = function(req,res){
	userAdmin.findOne({_id:req.body.id},function(err,data){
		if(data){
			res.json({status:true,info:data});
		}else{
			res.json({status:false,info:err});
		}
	});
};

exports.creaUserAdmin = function(req,res){
  var datosAux = req.body;
  userAdmin.findOne({Usuario:datosAux.Usuario},function(err,result){
  	if(result){
  		res.json({status:false,info:"El Usuario ya existe"});
  	}else{
	  	userAdmin.count({},function(err,cont){
	  	datosAux.id = cont+1;
	   	user =  new userAdmin(datosAux);
	                user.save(function (err, obj) {
	                 if (!err){
	                 	res.json({status:true,info:"Usuario creado correctamente"});
	                 }else{
	                 	res.json({status:false,info:err});
	                 }  
	              });
	  });
  	}
  })
     
};

exports.editaUserAdmin = function(req,res){
  var datosAux = req.body.datos;
  var actualiza = false;
  userAdmin.findOne({_id:req.body.id},function(err,result){
  	if(result.Usuario!=datosAux.Usuario){
  		userAdmin.findOne({Usuario:datosAux.Usuario},function(err,resultado){
  			if(resultado){
  				res.json({status:false,info:"El Usuario ya existe"});
  			}else{
  				actualiza = true;
  			}
  		});
  	}else{
	 actualiza = true;
  	}
  	if(actualiza){
  		userAdmin.update({"_id" : mongoose.Types.ObjectId(req.body.id)},datosAux,{upsert:true},function(err,numAffected){
	                console.log(numAffected);
	                if(numAffected){
	                  res.json({status:true,info:"Usuario actualizado correctamente",id:req.body.id});
	                }else{
	                  res.json({status:false,info:"Error: "+err});
	                }
	    });
  	}
  });
};

exports.eliminaUserAdmin = function(req,res){
 userAdmin.remove({_id: req.body.id}, function(error){
      if(error){
         res.json({status:false,info:'Error al intentar eliminar el usuario'});
      }else{ 
         res.json({status:true,info:'Usuario eliminado correctamente'});
      }
   });
};

exports.logeo = function(req,res){
	res.render('login');
};

exports.logear = function(req,res){
	userAdmin.findOne({Usuario: req.body.Usuario,Pass:req.body.Pass},function(err,datos){
		if(datos){
			res.json({status:true,info:req.body.Usuario});
		}else{
			res.json({status:false,info:"Usuario o clave incorrecto"});
		}
	});
};

exports.panel = function(req,res){
		res.render('panel');
};
exports.session = function(req,res){
	console.log(req.body.user);
	if(req.body.user==null){
		res.render('login');
	}
}



