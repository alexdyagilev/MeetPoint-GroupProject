$(document).ready(function() {

  // Loading Google map
  var latLng = {
      lat: 33.7490,
      lng: -84.3880
  }
  var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center: latLng
  });

//Global CreateMarker Function--------------------------------------------------------------------
function createMarker(lat, lng, content, icon) {

    var marker = new google.maps.Marker({
        position: {
            lat: lat,
            lng: lng
        },
        icon: icon,
        map: map
    });
    var infoWindow = new google.maps.InfoWindow({
        content: content
    });
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map, marker);
    });
}
//----------------------------------------------------------------



//----------------------------------------------------------------

var peeps = [{
    name: "Morty",
    location: "NYC",
    lat: "40.712784",
    long: "-74.005941"
}, {
    name: "Harry",
    location: "ATL",
    lat: "33.748995",
    long: "-84.387982"
}, {
    name: "Bender",
    location: "LA",
    lat: "34.052234",
    long: "-118.243685"
}];

var sumLats = 0;
var averageLats = 0;

var sumLongs = 0;
var averageLongs = 0;

function meanLatLong() {

    for (var i = 0; i < peeps.length; i++) {
        var uName = peeps[i].name;
        var uLat = Number(peeps[i].lat);
        sumLats += uLat;
        averageLats = sumLats / peeps.length;

        var uLng = Number(peeps[i].long);
        sumLongs += uLng;
        averageLongs = sumLongs / peeps.length;

        var userIcon = "assets/images/octopus32.png";
        console.log(userIcon);
        console.log(meetPointIcon);

        console.log(uLat, uLng, uName, userIcon);
        createMarker(uLat, uLng, uName, userIcon);

    };
    console.log(averageLats);
    console.log(averageLongs);
};
meanLatLong();

//Creating MeetPoint Marker
var meetPointIcon = "assets/images/blue_MarkerM.png";
var meetPointContent = "MeetPoint";
createMarker(averageLats, averageLongs, meetPointContent, meetPointIcon);

// YELP-----------------------------------------------------------------------------------


$("#yelp-btn").on("click", function(e) {

    e.preventDefault();

    function getMeters(i) {
        return i * 1609.344;
    }

    var yelpURL = "/api/yelp/v3/businesses/search";
    var term = $("#yelp-term").val();
    var location = $("#yelp-loc").val();
    var radiusMiles = $("#radius-input option:selected").attr("value");
    var radiusMeters = getMeters(radiusMiles);
    // Yelp takes radius in meters

    yelpURL += "?" + $.param({
        "term": term,
        "location": location,
        "limit": 10,
        "distance": radiusMeters //not sure if this works properly; check again later
    });
    // GLOBAL var for access token
    var accessToken = "dansSf9_Muex3BxxaCcbl3S2Up3UnypA";

    // do this one time
    $.ajax({
        url: "/api/yelp/oauth2/token",
        method: "POST",
        data: {
            grant_type: "client_credentials",
            client_id: "DKj-IPb7Z7qjDMphovCP9g",
            client_secret: "nL0yFJUv5cA95FmDE6Fq5B1jo4ss6z2dGpvvK5XFM9T6ii0ehmP6dypGBzA4rxuj"
        }
    }).done(function(response) {
        console.log(response);

        // update global variable for your accessToken
        accessToken = response.access_token;

        $.ajax({
            // '/api/yelp/' + everything in the examples after 'https://api.yelp.com/' i.e.
            url: yelpURL,
            method: "GET",
            headers: {
                // use your access token in every API request to proxy
                Authorization: "Bearer " + accessToken
            }
        }).done(function(response) {
            console.log(response);
            for (var i = 0; i < response.businesses.length; i++) {
                var businessName = response.businesses[i].name;
                var businessAddress = response.businesses[i].location.display_address[0] + ", " + response.businesses[i].location.display_address[1];
                var yelpLink = response.businesses[i].url;
                var yLat = response.businesses[i].coordinates.latitude;
                var yLng = response.businesses[i].coordinates.longitude;
                var busImage = response.businesses[i].image_url;
                var rating = response.businesses[i].rating;
                var reviewCount = response.businesses[i].review_count;
                var yContent = "<img src = " + busImage + " width = 250> <br> <b>" + businessName + "</b> <br>" + businessAddress + "<br>" + "Yelp Rating: " + rating + "<br>" + "Yelp Reviews: " + reviewCount;

                console.log(yLat);
                console.log(yLng);

                createMarker(yLat, yLng, yContent);


                $("#yelp-results").append("<tr><td>" + businessName + "</td></td><td>" + businessAddress + "</td><td><a href='" + yelpLink + "' target='_blank'>Go to Yelp Page</a></td></tr>");
            }
        });
    }).fail(function(err) {
        console.error(err)
    });
});

// GEOCODE-----------------------------------------------------------------------------------

$("#geocode-btn").on("click", function(event) {

    event.preventDefault();

    var geocodeURL = "/api/geocode";
    var address = $("#geocode-input").val();
    var geocodeKey = "AIzaSyBDX_eXekJVgS9WjggIhZRQbvNXlbFQDsc";

    geocodeURL += "?" + $.param({
        "api_key": geocodeKey,
        "address": address
    });

    $.ajax({
        // '/api/flightstats/' + everything in the examples after '/v2/json/' i.e.
        url: geocodeURL,
        method: "GET"
    }).done(function(response) {
        console.log(response);
        var formattedAddress = response.results[0].formatted_address;
        var lat = response.results[0].geometry.location.lat;
        var lng = response.results[0].geometry.location.lng;
        var coordinates = "(" + lat + ", " + lng + ")";

        $("#geocode-results").append("<tr><td>" + formattedAddress + "</td><td>" + coordinates + "</td></tr>");

    }).fail(function(err) {
        console.error(err)
    });

    $("#geocode-input").val("");
});

});
