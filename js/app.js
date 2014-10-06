/**
 * C�digo con la l�gica de la aplicaci�nde compras.
 * @apedreroes
 * Adaptado de: http://blog.teamtreehouse.com/create-your-own-to-do-app-with-html5-and-indexeddb
 */


window.onload = function() {
  
  comprarDB.open(actualizarCompras);
  
  
  var formNuevaCompra = document.getElementById('form-nueva-compra');
  var inputNuevaCompra = document.getElementById('nueva-compra');
  var botonBorrarDatos = document.getElementById('borrarDatos');
  var botonBorrarTabla = document.getElementById('borrarTabla');
  
  
  formNuevaCompra.onsubmit = function() {
    var aComprar = inputNuevaCompra.value;
    
    if (aComprar.replace(/ /g,'') !== '') {
      comprarDB.anadirCompra(aComprar, function(compra) {
        actualizarCompras();
      });
    }
    
    inputNuevaCompra.value = '';
    
    return false; // Para que el formulario no sea enviado
  };

  botonBorrarDatos.onclick = function() {
    console.log("borrar� los datos");
    comprarDB.borrarDatos();
  };

  botonBorrarTabla.onclick = function() {
    console.log("borrar� la tabla");
    comprarDB.borrarTabla();
  };
  
};


function actualizarCompras() {  
  comprarDB.buscarCompras(function(compras) {
    var listaCompra = document.getElementById('lista-compra');
    listaCompra.innerHTML = '';
    
    for(var i = 0; i < compras.length; i++) {
      // Read the compra items backwards (most recent first).
      var compra = compras[(compras.length - 1 - i)];

      var li = document.createElement('li');
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.className = "compra-checkbox";
      checkbox.setAttribute("data-id", compra.timestamp);
      
      li.appendChild(checkbox);
      
      var span = document.createElement('span');
      span.innerHTML = compra.aComprar;
      
      li.appendChild(span);
      
      listaCompra.appendChild(li);
      
      checkbox.addEventListener('click', function(e) {
        var id = parseInt(e.target.getAttribute('data-id'));

        comprarDB.borrarCompra(id, actualizarCompras);
      });
    }

  });
}