function FavoritesConfiguration(currentPosition, weatherInstance)
{
    _thisF = this;
    this.currentPosition = currentPosition;
    this.weatherInstance = weatherInstance;
}

FavoritesConfiguration.prototype.initialize = function () {
    //var currentPosition = JSON.parse(localStorage.getItem("currentPosition"));    
    var mapOptions = {
        center: new google.maps.LatLng(_thisF.currentPosition.lat, _thisF.currentPosition.long),
        zoom: 13
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

    var input = /** @type {HTMLInputElement} */(
            document.getElementById('pac-input'));

//    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
//    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    marker.setPosition(new google.maps.LatLng(_thisF.currentPosition.lat, _thisF.currentPosition.long));
    marker.setVisible(true);

    infowindow.setContent('<div id="info"><span id="name"><strong>' +
            _thisF.currentPosition.name +
            '</strong></span><br><button type="button" class="btn btn-primary" id="save">Save</button></div>');
    infowindow.open(map, marker);

    _thisF.loadHandlerSave(_thisF.currentPosition.lat,
            _thisF.currentPosition.long,
            _thisF.currentPosition.name);

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var name = "";
        for (var i = 0; i < place.address_components.length; i++) {
            for (var b = 0; b < place.address_components[i].types.length; b++) {

                //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (place.address_components[i].types[b] === "locality") {
                    //this is the object you are looking for
                    name = place.address_components[i].long_name;
                }
                if (place.address_components[i].types[b] === "administrative_area_level_4" && name === "") {
                    //this is the object you are looking for
                    name = place.address_components[i].long_name;
                }
                if (place.address_components[i].types[b] === "administrative_area_level_3" && name === "") {
                    //this is the object you are looking for
                    name = place.address_components[i].long_name;
                }
                if (place.address_components[i].types[b] === "administrative_area_level_2" && name === "") {
                    //this is the object you are looking for
                    name = place.address_components[i].long_name;
                }
                if (place.address_components[i].types[b] === "country") {
                    name += ", " + place.address_components[i].short_name;
                }
            }
        }

        infowindow.setContent('<div id="info"><span id="name"><strong>' +
                name +
                '</strong></span><br><button type="button" class="btn btn-primary" id="save">Save</button></div>');
        infowindow.open(map, marker);

        _thisF.loadHandlerSave(place.geometry.location.k, place.geometry.location.B, name);

    });
};

FavoritesConfiguration.prototype.loadHandlerSave = function (lat, long, name)
{
    $(document).off("click", "#save");
    $(document).on("click", "#save", function ()
    {
        var favorites = localStorage.getItem("favorites");
        if (favorites)
            favorites = JSON.parse(favorites);
        else
            favorites = [];
        if (favorites.length < 2) {
            var newFavorite = {
                lat: lat,
                long: long,
                name: name
            };
            favorites.unshift(newFavorite);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            $(".alert-success").fadeIn("slow");
            setTimeout(function ()
            {
                $(".alert-success").fadeOut("slow");
            }, 3000);
            _thisF.weatherInstance.loadFavorites();
            _thisF.weatherInstance.loadFavoritesWeather();
            _thisF.weatherInstance.loadHandlers();
        } else
        {
            $(".alert-danger").fadeIn("slow");
            setTimeout(function ()
            {
                $(".alert-danger").fadeOut("slow");
            }, 3000);
        }
    });
};