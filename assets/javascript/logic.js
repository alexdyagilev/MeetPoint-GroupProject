
$("#submit-btn").on("click", function(event) {
	var name = $("#name").val().trim();
	var startLocation = $("#startLocation").val().trim();

	console.log("name: " + name + " location: " + startLocation);

	var config = {
    apiKey: "AIzaSyDWgY0ASwb81g1E0AVT5pvTR1DiDtXx1c4",
    authDomain: "meetpoint-8e687.firebaseapp.com",
    databaseURL: "https://meetpoint-8e687.firebaseio.com",
    storageBucket: "meetpoint-8e687.appspot.com",
    messagingSenderId: "800664455878"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  var url = "https://maps.googleapis.com/maps/api/geocode/json";
  var key = "AIzaSyBDX_eXekJVgS9WjggIhZRQbvNXlbFQDsc";
  var address = $("#startLocation").val();

  url += "?" + $.param({
        "api_key": key,
        "address": address
      });

  $.ajax({
    url: url,
    method: "GET"
  }).done(function(response) {
    console.log(response);
    var formattedAddress = response.results[0].formatted_address;
    var latitude = response.results[0].geometry.location.lat;
    var longitude = response.results[0].geometry.location.lng;
    var coordinates = "(" + latitude + ", " + longitude + ")";

    database.ref().push({
      name: name,
      startLocation: startLocation,
      latitude: latitude,
      longitude: longitude
    });

    console.log("lat: " + latitude + " lng: " + longitude);
})



})


$("#submit-btn").click(function () {
        $("form").trigger("reset");
    });	

