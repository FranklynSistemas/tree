 
 exports.GeneraFechaIniFinal = function(Action){
  var FechaInicio = 0, FechaFinal = 0;

  var fechaHoy = new Date(),
      MesFechaHoy = fechaHoy.getMonth().toString().length > 1 ? fechaHoy.getMonth() : '0'+(fechaHoy.getMonth()+1),
      DiaFechaHoy = fechaHoy.getDate().toString().length > 1 ? fechaHoy.getDate() : '0'+fechaHoy.getDate(),
      HoraFechaHoy = fechaHoy.getHours().toString().length > 1 ? fechaHoy.getHours() : '0'+fechaHoy.getHours(), 
      MinutosFechaHoy = fechaHoy.getMinutes().toString().length > 1 ? fechaHoy.getMinutes() : '0'+fechaHoy.getMinutes(), 
      fechaString = fechaHoy.getFullYear()+'-'+MesFechaHoy+'-'+DiaFechaHoy+'T'+HoraFechaHoy+':'+MinutosFechaHoy+'+0500',
      fechaColombia = new Date(fechaString);
      //Action === 1 Registro 7 dias
      //Action === 2 Pago Suscripcion  30 dias
  switch(Action){
    case 1:
       FechaInicio = fechaColombia.valueOf();
       FechaFinal = FechaInicio + ( 7 * 24 * 60 * 60 * 1000 );
       return {FechaInicio : FechaInicio, FechaFinal: FechaFinal};
    break;
    case 2:
       FechaInicio = fechaColombia.valueOf();
       FechaFinal = FechaInicio + ( 30 * 24 * 60 * 60 * 1000 );
       return {FechaInicio : FechaInicio, FechaFinal: FechaFinal};
    break;
    case 3:
       return fechaColombia.valueOf();
    break;
  }
}
