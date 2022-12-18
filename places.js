var searchInput = 'input';
var marker;
var request;
window.onload = function() {
    // josh
    var location = {
        // lat: (40, 000),
        // lng: (-79, 000)
        lat: 40,
        lng: -79
    }
    var options = {
        center: location,
        zoom: 15
    }
    if (navigator.geolocation) {
        //console.log('geolocation is here');
        navigator.geolocation.getCurrentPosition((loc) => {
            location.lat = loc.coords.latitude;
            location.lng = loc.coords.longitude;
            // write the map
            map = new google.maps.Map(document.getElementById("map"), options);
        }, (err) => {
            console.log('location request denied');
            // map = new google.maps.Map(document.getElementById("map"), options);
        })
    } else {
        console.log('geolocation not supported');
        map = new google.maps.Map(document.getElementById("map"), options);
    }
    // Autocomplete
    var autocomplete;
    autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput)), {
        types: ['establishment'],
        componentRestrictions: {
            country: "USA"
        },
        fields: ['geometry', 'name', 'reviews']
    });
    // Add Event Listener to Autocomplete
    autocomplete.addListener('place_changed', onPlaceChanged);
    // Fires when autocomplete place changes
    function onPlaceChanged() {
        // Get the place
        var place = autocomplete.getPlace();
        // If place has location data
        if (place.geometry) {
            // Move map to place
            map.panTo({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            });
            // Look up restaurants within 4000 meters (almost 2.5 miles)
            var request = {
                location: new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
                radius: '5000',
                types: ['restaurant']
            };
            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback);
            // Fires when nearbySearch is complete
            function callback(results, status) {
                // If details are successfully retruned
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        // Creates a marker for each result, create marker function below
                        createMarker(results[i]);
                    }
                }
            }

            // Create a single info window 
            var infoWindow = new google.maps.InfoWindow({
                maxWidth: 350,
            })

            // Function to create markers
            function createMarker(place) {
            
                // Get the place information
                service.getDetails({
                    placeId: place.place_id
                }, function(place, status) {
                    // If details are successfully retruned
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // Creates the marker object, setting location and assigning to the map
                        var marker = new google.maps.Marker({
                            position: place.geometry.location,
                            map: map
                        });

                        // Add a click event listener to the marker
                        google.maps.event.addListener(marker, 'click', (function(marker) {
                            return function() {
                                // Set the content of the window, for now just shows the name and then iterates over the reviews
                                infoWindow.setContent(`<h2>${place.name}</h2>` + place.reviews.map((review) => {
                                    return (`<div><p>${review.author_name}</p><p><strong>Review Score:</strong> ${review.rating}</p><p><i>${review.relative_time_description}</i></p><p>"${review.text}"</p></div><hr />`);
                                }).join(''));
                                infoWindow.open(map, marker);
                                // Recentre map when clicked
                                map.panTo(marker.getPosition());
                            };
                        })(marker));
    
                    }
                });
            }
        }
    }
}