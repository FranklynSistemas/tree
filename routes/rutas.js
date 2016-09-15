var express = require('express');
var router = express.Router();

//var Usuarios = require('../schemas/usuarios');
var Contactos = require('../schemas/contactos');

//Autenticacion
var auth = require('./auth');  
var middleware = require('./middleware');

//Envio de Correos
var sendgrid = require('sendgrid')('');

//Consultas
var consultas = require('./Utilidades/consultas');

//Pagos
//var pagos = require('./Utilidades/pagos');

//Noticias
//var publica = require('./Utilidades/publica');
router.get('/', function (req, res) {
    res.render('index');
});

router.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nSitemap:http://tree-it.co/sitemap.xml");
});
/*
router.get('/google6c73bb35cee5c37d.html', function (req, res) {
   res.render('google6c73bb35cee5c37d');   
});
*/
router.get('/sitemap.xml', function (req, res) {
    var sitemap = generate_xml_sitemap();
    res.header('Content-Type', 'text/xml');
    res.send(sitemap);
});

//Guarda un contacto en la BD
router.post("/CrearContacto", function(req, res){
   	var datos = req.body;
	Contactos.count(function(err, cont){
	      		var datosAux = datos;
	      		datosAux.id = cont++;
	      		contacto =  new Contactos(datosAux);
	      		contacto.save(function (err, obj) {
	               if (!err){
                    envioCorreos(['dproyectos@tree-it.co','dtecnologia@tree-it.co'],generaHtml(datos));
	               	res.json({status: true});
	               }else{
	               	res.json({status: true});
	               } 	                  
	            });
	   });  
});  

// Rutas de autenticación y login
router.post('/auth/signup', auth.emailSignup);  
router.post('/auth/login', auth.emailLogin);
router.post('/auth/limpiaSesion', auth.limpiaSesion);


//Perfil
router.post('/TraePerfil', consultas.TraePefil); 
router.post('/ActualizaPerfil', consultas.ActualizaPefil); 
router.post('/CreaComentario', consultas.CreaComentario); 


//Cocheros
router.get('/TraeCocheros',consultas.TraeCocheros);
router.post('/AgregarFavoritos',consultas.AgregarFavoritos);
router.post('/TraerFavoritos',consultas.TraerFavoritos);

//Recuperar pass
router.post('/RecuperarPass',consultas.RecuperarPass);

// Ruta solo accesible si estás autenticado
router.get('/private',middleware.ensureAuthenticated, function(req, res) {

});

router.get("*", function(req, res){
	
	res.status(404).send("Página no encontrada :( en el momento");

});


function envioCorreos(correos,datos){
	sendgrid.send({
	  to:        correos,
	  from:      'dproyectos@tree-it.co',
	  subject:  'Nuevo Contacto Tree IT',
	  html:      datos
	}, function(err, json) {
	  if (err) { return console.error(err); }
	  console.log(json);
	});
}



function generate_xml_sitemap() {
    // this is the source of the URLs on your site, in this case we use a simple array, actually it could come from the database
    var urls = ['contact', 'index', 'procesos', 'quees','quienessomos','actualidad','normatividad','asocpublic'];
    // the root of your website - the protocol and the domain name with a trailing slash
    var root_path = 'http://www.inprix.co/';
    // XML sitemap generation starts here
    var priority = 0.5;
    var freq = 'daily';
    var xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for (var i in urls) {
        xml += '<url>';
        xml += '<loc>'+ root_path + urls[i] + '</loc>';
        xml += '<changefreq>'+ freq +'</changefreq>';
        xml += '<priority>'+ priority +'</priority>';
        xml += '</url>';
        i++;
    }
    xml += '</urlset>';
    return xml;
}

function generaHtml(data){
    return "<h1>Se ha creado un nuevo contacto</h1>"+
            "<p>Nombre: "+data.Nombres+"</p>"+
            "<p>Correo: "+data.Correo+"</p>"+
            "<p>Asunto: "+data.Asunto+"</p>"+
            "<p>Mensaje: "+data.Mensaje+"</p>";
}

module.exports = router;
