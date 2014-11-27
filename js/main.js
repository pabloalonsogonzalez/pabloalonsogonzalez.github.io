/**
 * Instancia de la clase WeatherInstance
 * @returns {WeatherInstance}
 */
function WeatherInstance()
{
    _this = this;
//    this.online = true;
    this.favoritesConfiguration = null;
    // indica si es necesario cargar el mapa (sólo la primera vez)
    this.firstConfiguration = true;
    this.currentForecast = null;
    this.appid = "1e9984d08b5a4d36e82a4cd662c541a5";
    this.address = {
        city: "",
        country: ""
    };
//    this.handlerOnline();
    // if hay conexion, si no no hay que pedir las cosas
    if (online)
    {
        this.loadScript();
//        this.getCurrentPositionWeather();
    } else {
        this.loadOffline();
        $("#configurate").attr("disabled", true);
    }
    this.loadFavorites();
    if (online)
    {
        this.loadFavoritesWeather();
    }
}

WeatherInstance.prototype.handlerOnline = function () {
    window.addEventListener("online", function online() {
//            $('#offline').hide();
        online = true;
        $("#configurate").removeAttr("disabled");
    });

    window.addEventListener("offline", function offline(e) {
//            $('#offline').show();
        online = false;
        $("#configurate").attr("disabled", "disabled");
    });
};

WeatherInstance.prototype.loadScript = function () {
    var element = document.createElement('script');
    element.src =
            'http://maps.googleapis.com/maps/api/js?sensor=true&v=3.exp&libraries=places'
            + '&callback=_this.getCurrentPositionWeather';
    element.type = 'text/javascript';
    var scripts = document.getElementsByTagName('script')[0];
    scripts.parentNode.insertBefore(element, scripts);
};

WeatherInstance.prototype.loadOffline = function ()
{
    _this.setCurrentPositionCurrentWeather();
    _this.setCurrentPositionForecast();
};

/**
 * Obtiene los favoritos del localStorage y pide su tiempo actual y su predicción
 */
WeatherInstance.prototype.loadFavoritesWeather = function ()
{
    var favorites = JSON.parse(localStorage.getItem("favorites"));
    if (favorites !== null)
        $.each(favorites, function (i, fav)
        {
            _this.getCurrentWeather(fav, false);
            _this.getForecast(fav, false);
        });
//    $("#lastUpdate small").text("Last update = " +
//            moment().format("dddd, MMMM Do YYYY, H:mm:ss"));
};

/**
 * Método llamado una vez cargados todos los datos, para evitar que aparezcan
 * partes del html sin rellenar
 */
WeatherInstance.prototype.loaded = function ()
{
    $($("main").children()[0]).hide();
    $("#lastUpdate").show();
    $("#current").show();
    $("#forecast").show();
    $(".navbar-toggle").removeAttr("disabled");
    $("a.disabled").removeClass("disabled");
};

/**
 * Recupera del localStorage la posición actual y su tiempo actual y llama al
 * método que muestra los datos
 */
WeatherInstance.prototype.setCurrentPositionCurrentWeather = function ()
{
    var current = JSON.parse(localStorage.getItem("currentLocal"));
//    var currentPosition = JSON.parse(localStorage.getItem("currentPosition"));
//    $.each(current, function (i)
//    {
//        if (current[i].currentLocation)
//            _this.setCurrentWeather(current[i]);
//    });
    _this.setCurrentWeather(current);
    $("#current").find("h2").text(current.name);
    var span = $("<span class='glyphicon glyphicon-map-marker'></span>");
    $("#current").find("h2").prepend(span);
};

/**
 * Recupera del localStorage la posición actual y su predicción y llama al
 * método que muestra los datos
 */
WeatherInstance.prototype.setCurrentPositionForecast = function ()
{
    var forecast = JSON.parse(localStorage.getItem("forecastLocal"));
//    $.each(forecast, function (i)
//    {
//        if (forecast[i].currentLocation)
//            _this.setForecast(forecast[i], 0, _this.loaded);
//
//    });
    _this.setForecast(forecast, 0, _this.loaded);
};

/**
 * Obtiene el nombre de la ciudad de la posición actual y pide su predicción y
 * tiempo actual
 * @param {jsonObject} location : coordenadas de la posición actual
 */
WeatherInstance.prototype.getNameCurrentPosition = function (location)
{
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(location.coords.latitude,
            location.coords.longitude);

    geocoder.geocode({'latLng': latlng}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                //formatted address
                //alert(results[0].formatted_address)
                //find country name
                for (var i = 0; i < results[0].address_components.length; i++) {
                    for (var b = 0; b < results[0].address_components[i].types.length; b++) {

                        //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (results[0].address_components[i].types[b] === "locality") {
                            //this is the object you are looking for
                            _this.address.city = results[0].address_components[i].long_name;
                        }
                        if (results[0].address_components[i].types[b] === "administrative_area_level_4") {
                            //this is the object you are looking for
                            _this.address.city = results[0].address_components[i].long_name;
                        }
                        if (results[0].address_components[i].types[b] === "administrative_area_level_3") {
                            //this is the object you are looking for
                            _this.address.city = results[0].address_components[i].long_name;
                        }
                        if (results[0].address_components[i].types[b] === "administrative_area_level_2") {
                            //this is the object you are looking for
                            _this.address.city = results[0].address_components[i].long_name;
                        }
                        if (results[0].address_components[i].types[b] === "country") {
                            _this.address.country = results[0].address_components[i].short_name;
                        }
                    }
                }
                var currentPosition = {
                    lat: location.coords.latitude,
                    long: location.coords.longitude,
                    name: _this.address.city + ", " + _this.address.country
                };
                localStorage.setItem("currentPosition", JSON.stringify(currentPosition));
                _this.favoritesConfiguration = new FavoritesConfiguration(currentPosition, _this);
                _this.getCurrentWeather(currentPosition, true, _this.setCurrentPositionCurrentWeather);
                _this.getForecast(currentPosition, true, _this.setCurrentPositionForecast);

            } else {
                alert("No results found");
            }
        } else {
            alert("Geocoder failed due to: " + status);
        }
    });

};

/**
 * Obtiene la posición actual
 */
WeatherInstance.prototype.getCurrentPositionWeather = function ()
{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (l)
        {
            _this.getNameCurrentPosition(l);
        },
                function (err) {
                    console.log('ERROR(' + err.code + '): ' + err.message);
                }, {timeout : Infinity, enableHighAccuracy: true, maximumAge: 0});
    } else {
        alert("NO HAY SOPORTE");
    }
};

/**
 * Obtiene los favoritos del localStorage y los escribe en la barra de navegación
 */
WeatherInstance.prototype.loadFavorites = function ()
{
    var favorites = localStorage.getItem("favorites");
    if (favorites) {
        favorites = JSON.parse(favorites);
        $(".favorite").remove();
        $($("#favoritesSaved").children()).remove();
        $.each(favorites, function (i, fav)
        {
            $(".dropdown-menu").prepend("<li><a href='#' class='favorite'>"
                    + fav.name + "</a></li>");
            $("#favoritesSaved").prepend("<li class='list-group-item'>"
                    + fav.name
                    + "<span class='glyphicon glyphicon-chevron-right'></span><span class='glyphicon glyphicon-trash'></span></li>");
        });
    }
    var lastUpdate = localStorage.getItem("lastUpdate");
    if (lastUpdate)
        $("#lastUpdate small").text(lastUpdate);
};

/**
 * Borra todos los datos almacenados en el localStorage, excepto los favoritos
 */
WeatherInstance.prototype.clearLocalStorage = function ()
{
//    localStorage.removeItem("lastUpdate");
//    localStorage.removeItem("current");
//    localStorage.removeItem("forecast");
//    localStorage.removeItem("currentPosition");
};


/**
 * Pide a la API el tiempo en la posición que recibe por parámetro y llama al 
 * método que almacena los datos en el localStorage
 * @param {jsonObject} location : posición de la que se quiere recibir los datos
 * @param {boolean} currentLocation : indica si la location es la posición actual
 * @param {function} callback : función callback para mostrar los datos una vez que
 * hayan sido guardados
 */
WeatherInstance.prototype.getCurrentWeather = function (location, currentLocation, callback)
{
    var url = "http://api.openweathermap.org/data/2.5/weather";
    var data = {
        lat: location.lat,
        lon: location.long,
        APPID: this.appid
    };

    $.get(url, data, function (current)
    {
        _this.saveCurrent(current, location.name, currentLocation, callback);
        var lastUpdate = "Last update = " +
                moment().format("dddd, MMMM Do YYYY, H:mm:ss");
        localStorage.setItem("lastUpdate", lastUpdate);
        $("#lastUpdate small").text(lastUpdate);
    });
};

/**
 * Pide a la API la predicción tiempo en la posición que recibe por parámetro
 * y llama al método que almacena los datos en el localStorage
 * @param {jsonObject} location : posición de la que se quiere recibir los datos
 * @param {boolean} currentLocation : indica si la location es la posición actual
 * @param {function} callback : función callback para mostrar los datos una vez que
 * hayan sido guardados
 */
WeatherInstance.prototype.getForecast = function (location, currentLocation, callback)
{

    var url = "http://api.openweathermap.org/data/2.5/forecast/daily";
    var data = {
        lat: location.lat,
        lon: location.long,
        cont: "5",
        mode: "json",
        APPID: this.appid
    };

    $.get(url, data, function (forecast)
    {
        _this.saveForecast(forecast, location.name, currentLocation, callback);
        var lastUpdate = "Last update = " +
                moment().format("dddd, MMMM Do YYYY, H:mm:ss");
        localStorage.setItem("lastUpdate", lastUpdate);
        $("#lastUpdate small").text(lastUpdate);
    });
};

/**
 * Almacena el tiempo actual en el localStorage y luego llama al método que lo
 * muestra
 * @param {jsonObject} current : datos del tiempo actual recibidos de la API
 * @param {String} name : nombre de la localidad a guardar sus datos
 * @param {boolean} currentLocation : indica si la location es la posición actual
 * @param {function} callback : functión que muestra el tiempo una vez guardado
 */
WeatherInstance.prototype.saveCurrent = function (current, name, currentLocation, callback)
{
//    var c = localStorage.getItem("current");
//    if (c)
//        c = JSON.parse(c);
//    else
//        c = [];
    if (currentLocation)
        localStorage.removeItem("currentLocal");
    else
        localStorage.removeItem("current-" + name);
    var newCurrent = {
        name: name,
        currentLocation: currentLocation,
        country: current.sys.country,
        icon: current.weather[0].icon,
        description: current.weather[0].description.toLowerCase(),
        temp: (current.main.temp - 273.15).toFixed(1),
        temp_min: (current.main.temp_min - 273.15).toFixed(1),
        temp_max: (current.main.temp_max - 273.15).toFixed(1),
        humidity: current.main.humidity
    };
//    c.unshift(newCurrent);
    if (currentLocation)
        localStorage.setItem("currentLocal", JSON.stringify(newCurrent));
    else
        localStorage.setItem("current-" + name, JSON.stringify(newCurrent));
    if (arguments[2])
        callback();
};

/**
 * Almacena la predicción del tiempo en el localStorage y luego llama al método 
 * que lo muestra
 * @param {jsonObject} forecast : datos de la predicción de tiempo recibidos de 
 * la API
 * @param {String} name : nombre de la localidad a guardar sus datos
 * @param {boolean} currentLocation : indica si la location es la posición actual
 * @param {function} callback : functión que muestra el tiempo una vez guardado
 */
WeatherInstance.prototype.saveForecast = function (forecast, name, currentLocation, callback)
{
//    var f = localStorage.getItem("forecast");
//    if (f)
//        f = JSON.parse(f);
//    else
//        f = [];
    if (currentLocation)
        localStorage.removeItem("forecastLocal");
    else
        localStorage.removeItem("forecast-" + name);
    var days = [];
    $.each(forecast.list, function (i, itemData)
    {
        days[i] = {
            dt: moment.unix(itemData.dt).format("dddd"),
            dtD: moment.unix(itemData.dt).format("D"),
            dtM: moment.unix(itemData.dt).format("M"),
            icon: itemData.weather[0].icon,
            description: itemData.weather[0].description.toLowerCase(),
            // pasar a grados
            temp: (itemData.temp.day - 273.15).toFixed(1),
            temp_min: (itemData.temp.min - 273.15).toFixed(1),
            temp_max: (itemData.temp.max - 273.15).toFixed(1),
            humidity: itemData.humidity
        };
    });
    // delete today
    days.splice(0, 1);
    var newForecast = {
        name: name,
        currentLocation: currentLocation,
        list: days
    };
    if (newForecast.currentLocation)
    {
        _this.currentForecast = newForecast;
        _this.loadHandlers();
    }
//    f.unshift(newForecast);
    if (currentLocation)
        localStorage.setItem("forecastLocal", JSON.stringify(newForecast));
    else
        localStorage.setItem("forecast-" + name, JSON.stringify(newForecast));
    if (arguments[2])
        callback();
};

/**
 * Muestra el tiempo actual
 * @param {jsonObject} current : datos a mostrar
 */
WeatherInstance.prototype.setCurrentWeather = function (current)
{
    $("#current").find("h2").addClass("fadeInLeft animated")
            .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend"
                    , function ()
                    {
                        $(this).removeClass("fadeInLeft animated");
                    });
    $("#current").find("img").attr("src", "css/img/weather/" + current.icon + ".png")
            .attr("alt", current.description)
            .attr("title", current.description);
    $("#current").find("img").addClass("zoomIn animated")
            .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend"
                    , function ()
                    {
                        $(this).removeClass("zoomIn animated");
                    });
    $("#current").find(".description").text(current.description);
    $("#current").find("h5").text(current.temp + " ºC");
    var temp_max = $("#current").find(".temp")[0];
    $("#current").find(temp_max).text(current.temp_max + " ºC");
    var temp_min = $("#current").find(".temp")[1];
    $("#current").find(temp_min).text(current.temp_min + " ºC");
    var hum = $("#current").find(".temp")[2];
    $("#current").find(hum).text(current.humidity + "%");
};

/**
 * Muestra la predicción del tiempo
 * @param {jsonObject} forecas : datos a mostrar
 */
/**
 * Muestra la predicción del tiempo
 * @param {jsonObject} forecast : datos a mostrar
 * @param {integer} i : día concreto del que mostrar su posición
 * @param {function} loaded : función callback que se llama una vez mostrado
 */
WeatherInstance.prototype.setForecast = function (forecast, i, loaded)
{
    $("#forecast").find("h3").text(forecast.list[i].dt);
    $("#forecast").find("h3").addClass("fadeInLeft animated")
            .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend"
                    , function ()
                    {
                        $(this).removeClass("fadeInLeft animated");
                    });
    $("#forecast").find("img").attr("src", "css/img/weather/" + forecast.list[i].icon + ".png")
            .attr("alt", forecast.list[i].description)
            .attr("title", forecast.list[i].description);
    $("#forecast").find("img").addClass("zoomIn animated")
            .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend"
                    , function ()
                    {
                        $(this).removeClass("zoomIn animated");
                    });

    $("#forecast").find(".description").text(forecast.list[i].description);
    $("#forecast").find("h5").text(forecast.list[i].temp + " ºC");
    var temp_max = $("#forecast").find(".temp")[0];
    $("#forecast").find(temp_max).text(forecast.list[i].temp_max + " ºC");
    var temp_min = $("#forecast").find(".temp")[1];
    $("#forecast").find(temp_min).text(forecast.list[i].temp_min + " ºC");
    var hum = $("#forecast").find(".temp")[2];
    $("#forecast").find(hum).text(forecast.list[i].humidity + "%");

    if (arguments[2])
        loaded();
};

/**
 * Carga los manejadores
 */
WeatherInstance.prototype.loadHandlers = function ()
{

    $("#days").children().remove();
    $.each(_this.currentForecast.list, function (index)
    {
        $("#days").append("<a class='list-group-item' data-day='"
                + index + "'><h4 class='list-group-item-heading'>"
                + _this.currentForecast.list[index].dt.substring(0, 3)
                + "</h4><p class='list-group-item-text'>"
                + _this.currentForecast.list[index].dtD + "/"
                + _this.currentForecast.list[index].dtM
                + "</p></a>");
    });

    _this.loadDaysHandler(_this.currentForecast);


    $("#home").click(function ()
    {
        if (online)
        {
            _this.getCurrentPositionWeather();
        } else {
            _this.setCurrentPositionCurrentWeather();
            _this.setCurrentPositionForecast();
        }
        $(".navbar-toggle").click();
        _this.loadDaysHandler(_this.currentForecast);
        $("#configuration").hide();
    });

    $(".favorite").click(function ()
    {
        if (online)
        {
            _this.loadFavoritesWeather();
        }
        var fav = $(this);
        var current = JSON.parse(localStorage.getItem("current-" + fav.text()));
        var forecast = JSON.parse(localStorage.getItem("forecast-" + fav.text()));

        _this.setCurrentWeather(current);
        $("#current").find("h2").text(fav.text());
        _this.loadDaysHandler(forecast);
        _this.setForecast(forecast, 0, _this.loaded);
//        var current = JSON.parse(localStorage.getItem("current"));
//        var forecast = JSON.parse(localStorage.getItem("forecast"));
//        $.each(current, function (i)
//        {
//            if (current[i].name === fav.text())
//            {
//                _this.setCurrentWeather(current[i]);
//                $("#current").find("h2").text(fav.text());
//            }
//
//            if (forecast[i].name === fav.text())
//            {
//                _this.loadDaysHandler(forecast[i]);
//                _this.setForecast(forecast[i], 0, _this.loaded);
//            }
//        });

        $(".navbar-toggle").click();
        $("#configuration").hide();
    });

    $("#configurate").click(function ()
    {
        $("#lastUpdate").hide();
        $("#current").hide();
        $("#forecast").hide();
        if (_this.firstConfiguration)
        {
            $("#configuration").show(_this.favoritesConfiguration.initialize);
            _this.firstConfiguration = false;
        } else {
            $("#configuration").show();
            $("#pac-input").val("");
        }
        $(".navbar-toggle").click();
    });

    $.each($("#favoritesSaved").children(), function (i, fav)
    {
        $(fav).on("swipe", function (e)
        {
            var favorites = JSON.parse(localStorage.getItem("favorites"));
            $.each(favorites, function (j)
            {
                if (favorites[j].name === $(e.target).text()) {
                    favorites.splice(j, 1);
                    return false;
                }
            });
            var favoritesBar = $(".favorite");
            $.each(favoritesBar, function (k)
            {
                if ($(favoritesBar[k]).text() === $(e.target).text())
                    $(favoritesBar[k]).remove();
            });
            localStorage.setItem("favorites", JSON.stringify(favorites));
            localStorage.removeItem("current-" + $(e.target).text());
            localStorage.removeItem("forecast-" + $(e.target).text());
            $(e.target).remove();
//            _this.loadFavorites();
//        _this.loadFavoritesWeather();
//            _this.loadHandlers();
        });
    });



};

/**
 * Carga los manejadores para los días
 * @param {jsonObject} forecast : datos de predicción del tiempo
 */
WeatherInstance.prototype.loadDaysHandler = function (forecast)
{
    $("#days").on("click", "a", function (e)
    {
        e.preventDefault();
        var nDay = $(this).attr("data-day");
        _this.setForecast(forecast, nDay);
        $(this).addClass("active").siblings().removeClass("active");
    });

    $($("#days").children()[0]).addClass("active").siblings().removeClass("active");
    $("#days").scrollLeft(0);
    $("#days").scrollTop(0);
    $("main").scrollTop(0);
};

//WeatherInstance.prototype.check = function ()
//{
//    var xhr = new (window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
//    var status;
//
//    // Open new request as a HEAD to the root hostname with a random param to bust the cache
//    xhr.open("HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false);
//
//    // Issue request and handle response
//    try {
//        xhr.send();
//        console.log(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304);
//    } catch (error) {
//        console.log(false);
//    }
//};




var wInstance = null;
var online = true;
window.addEventListener("load", function ()
{
    if ("onLine" in navigator) {
//        window.addEventListener("online", function online() {
////            $('#offline').hide();
//            online = true;
//        });
//
//        window.addEventListener("offline", function offline(e) {
////            $('#offline').show();
//            online = false;
//        });

        if (navigator.onLine) {
//            $('#offline').hide();
            online = true;
        } else {
//            $('#offline').show();
            online = false;
        }
    } else {
        console.log("offline not supported");
    }

    wInstance = new WeatherInstance();
});
