function initMap() {
  var myMapCenter = { lat: 40.785091, lng: -73.968285 };
  var map = new google.maps.Map(document.getElementById('map'), {
    center: myMapCenter,
    zoom: 14
  });

  var searchInput = document.getElementById('search_input');
  var searchButton = document.getElementById('search_button');

  searchButton.addEventListener('click', function () {
    var searchQuery = searchInput.value;
    searchParkingGarages(searchQuery, map);
  });
}

function searchParkingGarages(searchQuery, map) {
  // Geocode the user's input to get the coordinates
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: searchQuery }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
      var location = results[0].geometry.location;

      // Set the bounds for the search
      var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(location.lat() - 0.05, location.lng() - 0.05),
        new google.maps.LatLng(location.lat() + 0.05, location.lng() + 0.05)
      );

      var service = new google.maps.places.PlacesService(map);
      service.textSearch(
        {
          query: 'parking garages',
          bounds: bounds,
          fields: ['name', 'geometry', 'opening_hours'],
        },
        function (results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            for (var i = 0; i < results.length; i++) {
              createMarker(results[i], map);
            }
            if (results.length > 0) {
              map.setCenter(results[0].geometry.location);
            }
          }
        }
      );
    } else {
      console.log('Geocode was not successful for the following reason: ' + status);
    }
  });
}


/* Rest of the JavaScript code remains the same */



/* initializing a markers array which will hold all of the markers */
var markers = [];
/* initializing an variable that will hold the value of the opened window*/
var currentInfoWindow = null;

/* creating a marker for each parking space */
function createMarker(place, map) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name
  });
  /* push a new marker into the array */
  markers.push(marker);

  var service = new google.maps.places.PlacesService(map);
  service.getDetails(
    {
      placeId: place.place_id,
      fields: ['opening_hours']
    },
    function (placeResult, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        var infowindow = new google.maps.InfoWindow({
          content:
            '<strong>' +
            place.name +
            '</strong><br>' +
            (placeResult.opening_hours
              ? placeResult.opening_hours.weekday_text.join('<br>')
              : 'Opening hours not available')
        });

        marker.addListener('click', function () {
          // Close the current info window if one is open
          if (currentInfoWindow) {
            currentInfoWindow.close();
          }
          // Open the clicked marker's info window
          infowindow.open(map, marker);
          // Set the current info window as the newly opened one
          currentInfoWindow = infowindow;
        });
      }
    }
  );
}

function searchParkingGarages(searchQuery, map) {
  var service = new google.maps.places.PlacesService(map);
  service.textSearch(
    { query: 'parking garages ' + searchQuery, fields: ['opening_hours'] },
    function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        clearMarkers();
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i], map);
        }
        if (results.length > 0) {
          map.setCenter(results[0].geometry.location);
        }
      }
    }
  );
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}
