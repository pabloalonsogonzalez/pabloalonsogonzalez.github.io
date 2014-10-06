/**
 * C�digo para interaccionar con la BD indexedDB
 * @apedreroes
 * Adaptado de: http://blog.teamtreehouse.com/create-your-own-to-do-app-with-html5-and-indexeddb
 */

var comprarDB = (function() {
  var cDB = {};
  var datastore = null;


  cDB.open = function(callback) {

    var version = 23;

    var request = indexedDB.open('comprar', version);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;
	    console.log("dentro de funci�n de actualizaci�n de bbdd");

      e.target.transaction.onerror = cDB.onerror;

      if (db.objectStoreNames.contains('comprar')) {
        db.deleteObjectStore('comprar');
		    console.log("borrado almacen de datos comprar");
      }

      var store = db.createObjectStore('comprar', {
        keyPath: 'timestamp'
      });
	    console.log("creado almacen de datos comprar");
    };


    request.onsuccess = function(e) {
      datastore = this.result;
	    console.log("BBDD abierta correctamente y con datos");
      
      callback();
    };

    request.onerror = cDB.onerror;
  };


  /**
   * buscarCompras
   * Crea el array compras con la lista de todos los elementos a comprar
   */
  cDB.buscarCompras = function(callback) {
    var db = datastore;
    var transaction = db.transaction(['comprar'], 'readwrite');
    var objStore = transaction.objectStore('comprar');

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = objStore.openCursor(keyRange);

    var compras = [];

    transaction.oncomplete = function(e) {
		console.log("completada transacci�n de recuperaci�n buscarCompras");
      callback(compras);
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
	  console.log("completada operaci�n de cursor de recuperaci�n buscarCompras");
      
      if (!!result === false) {
        return;
      }
      
      compras.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = cDB.onerror;
  };


  /**
   * anadirCompra
   * A�ade un elemento (recibido como par�metro) a la lista de la compra.
   */
  cDB.anadirCompra = function(aComprar, callback) {

    var db = datastore;


    var transaction = db.transaction(['comprar'], 'readwrite');

    var objStore = transaction.objectStore('comprar');

    var timestamp = new Date().getTime();
    
    var anadir = {
      'aComprar': aComprar,
      'timestamp': timestamp
    };

    var request = objStore.put(anadir);


    request.onsuccess = function(e) {
		console.log("completada transacci�n de a�adir compra");
      callback(anadir);
    };

    request.onerror = cDB.onerror;
  };


  /**
   * borrarCompra
   * Borra un elemento de la lista de la lista de la compra a partir de su id.
   */
  cDB.borrarCompra = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['comprar'], 'readwrite');
    var objStore = transaction.objectStore('comprar');
    
    var request = objStore.delete(id);
    
    request.onsuccess = function(e) {
		console.log("completada transacci�n de borrarCompra");
      callback();
    };
    
    request.onerror = function(e) {
      console.log(e);
    };
  };

  return cDB;
}());
