$(document).ready(function() {

  var groupListDiv = $(document.getElementById("div-group-list"));

  var signupModalBtn = $(document.getElementById("btn-signup-modal"));
  var signupFormBtn = $(document.getElementById("btn-signup-form"));
  var loginModalBtn = $(document.getElementById("btn-login-modal"));
  var loginFormBtn = $(document.getElementById("btn-login-form"));
  var groupModalBtn = $(document.getElementById("btn-group-modal"));
  var groupFormBtn = $(document.getElementById("btn-group-form"));
  var logoutBtn = $(document.getElementById("btn-logout"));

  var nameField = $(document.getElementById("input-name"));
  var emailField = $(document.getElementById("input-email"));
  var pwdField = $(document.getElementById("input-pwd"));
  var groupNameField = $(document.getElementById("input-group-name"));
  var groupPurposeField = $(document.getElementById("input-group-purpose"));
  var groupPlaceField = $(document.getElementById("input-group-place"));

  var loadPage = {
    start: function() {
      top.location = "index.html";
    },
    profile: function() {
      top.location = "profile.html";
    }
  }

  var config = {
    apiKey: "AIzaSyDWgY0ASwb81g1E0AVT5pvTR1DiDtXx1c4",
    authDomain: "meetpoint-8e687.firebaseapp.com",
    databaseURL: "https://meetpoint-8e687.firebaseio.com",
    storageBucket: "meetpoint-8e687.appspot.com",
    messagingSenderId: "800664455878"
  };

  firebase.initializeApp(config);

  var database = firebase.database();
  var auth = firebase.auth();


logoutBtn.on("click", function(e) {
  e.preventDefault();
  auth.signOut();
  loadPage.start();
});

 

// SIGN UP===========================================================
  var signupModal = $(document.getElementById("modal-signup"));
  var closeSignup = $(document.getElementById("close-signup"));

  signupModalBtn.on("click", function(e){
    e.preventDefault();
    signupModal.css("display", "block");
  });

  closeSignup.on("click", function(e) {
    e.preventDefault();
    signupModal.css("display","none");
  });

  signupFormBtn.on("click", function(e) {
    e.preventDefault();

    
    var email = emailField.val().trim();
    var pwd = pwdField.val().trim();

    auth.createUserWithEmailAndPassword(email, pwd)
    .then(function(user) {

      var displayName = nameField.val().trim();

      user.updateProfile({
        displayName: displayName
      });

      database.ref("users/" + user.uid).set({
        name: displayName,
        email: user.email
      }).then(loadPage.profile());

    }).catch(function(error) {

      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == "auth/weak-password") {
        alert("The password is too weak.");
      }
      else {
        console.log(errorMessage);
      }
      console.log(error);
    });

  });

// LOGIN==============================================================

 var loginModal = $(document.getElementById("modal-login"));
  var closeLogin = $(document.getElementById("close-login"));
  var loginEmail = $(document.getElementById("input-email-login"));
  var loginPwd = $(document.getElementById("input-pwd-login"));

  loginModalBtn.on("click", function(e) {
    e.preventDefault();
    loginModal.css("display", "block");
  });

  closeLogin.on("click", function(e) {
    e.preventDefault();
    loginModal.css("display", "none");
  });

  loginFormBtn.on("click", function(e) {
    e.preventDefault();

    var email = loginEmail.val().trim();
    var pwd = loginPwd.val().trim();

    auth.signInWithEmailAndPassword(email, pwd)
    .then(function(user) {
      loadPage.profile();
    }).catch(function(error) {

      var errorCode = error.code;
      var errorMessage = error.message;

      if (errorCode == "auth/wrong-password") {
        alert("Wrong password.");
      }
      else {
        console.log(errorMessage);
      }

    });

  });

// GROUP FORM=========================================================
  var groupModal = $(document.getElementById("modal-create-group"));
  var closeGroupForm = $(document.getElementById("close-create-group"));

  groupModalBtn.on("click", function(e) {
    e.preventDefault();
    groupModal.css("display", "block");
  });

  closeGroupForm.on("click", function(e) {
    e.preventDefault();
    groupModal.css("display", "none");
  });

  groupFormBtn.on("click", function(e) {
    e.preventDefault();


    var groupName = groupNameField.val();
    var groupPurpose = groupPurposeField.val();
    var groupPlace = groupPlaceField.val();

    database.ref("groups").push({
      name: groupName,
      purpose: groupPurpose,
      place: groupPlace
    }).then(function(snap) {
      var key = snap.getKey();
      var currentUser = auth.currentUser.displayName;
      database.ref("users/" + currentUser + "/groups/" + key).set(true);
      database.ref("groups/" + key + "/members/" + currentUser).set(true);
    });

    groupListDiv.append("<li class='group-list-item'>" + groupName +
          "<span class='group-options'><img src='assets/images/pencil.png' class='group-icon-edit'>" +
          "<img src='assets/images/chat.png' class='group-icon-chat'>" +
          "<img src='assets/images/octopus24.png' class='group-icon-info'></span></li>");

  groupModal.css("display", "none");

  });


var userGroups = [];

  auth.onAuthStateChanged(function(user) {



    if (user) {

      console.log("you are logged in");


      var userName = user.displayName;

      $("#nav-display-name").prepend(userName);

      database.ref("users/" + user.uid + "/groups").on("child_added", function(snapGroupsList) {
        var groupKey = snapGroupsList.getKey();

        database.ref("groups/" + groupKey).on("value", function(snapGroup) {
          var groupName = snapGroup.val().name;

          var itemTag = "<li class='group-list-item' data-value='" + groupKey + "'>" + groupName +
          "<span class='group-options'><img src='assets/images/pencil.png' class='group-icon-edit' data-value='" + groupKey + "'>" +
          "<img src='assets/images/chat.png' class='group-icon-chat' data-value='" + groupKey + "'>" +
          "<img src='assets/images/octopus24.png' class='group-icon-info' data-value='" + groupKey + "'></span></li>";

          if (userGroups.indexOf(groupName) === -1) {
            userGroups.push(itemTag);
          }
          
          groupListDiv.empty();

          for(i = 0; i < userGroups.length; i++) {
            groupListDiv.append(userGroups[i]);
          }

        });

      });
    }
    else {
      console.log("you are not logged in");
    }
  });

  var center = {
    lat: 33.902589225,
    lng: -84.369156975
  }

  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: center
  });

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

  var membersList = [];
  var midpoint = {};

  $(document).on("click", ".group-list-item", function() {

    var groupKey = $(this).attr("data-value");

    database.ref("groups/" + groupKey + "/members").on("child_added", function(snapMember) {
      
      var name = snapMember.getKey();
      var lat = Number(snapMember.val().startLat);
      var lng = Number(snapMember.val().startLng);
      var member = {
        name: name,
        lat: lat,
        lng: lng,
      };
      membersList.push(member);
    });
    createMembersIcons();
    database.ref("groups/" + groupKey + "/place").on("value", function(snapPlace) {
      var place = snapPlace.val();
      createYelpIcons(place);
    });
  });
  

  function createMembersIcons() {
    for (i = 0; i < membersList.length; i++) {
      var memberName = membersList[i].name;
      var memberLat = Number(membersList[i].lat);
      var memberLng = Number(membersList[i].lng);
      var memberIcon = "assets/images/octopus32.png"
      createMarker(memberLat, memberLng, memberName, memberIcon);
    }
  }
  
  function createYelpIcons(t) {
    var sumLat = 0;
    var sumLng = 0;
    var avgLat = 0;
    var avgLng = 0;
    for (i = 0; i < membersList.length; i++) {
      var memberName = membersList[i].name;
      var memberLat = Number(membersList[i].lat);
      var memberLng = Number(membersList[i].lng);
      
      sumLat += memberLat;
      sumLng += memberLng;
      avgLat = sumLat/membersList.length;
      avgLng = sumLng/membersList.length;
    }

    midpoint.lat = avgLat;
    midpoint.lng = avgLng;
    console.log(midpoint.lat, midpoint.lng);

    var yelpURL = "/api/yelp/v3/businesses/search";
    var term = t;
    // var radiusMiles = $("#radius-input option:selected").attr("value");
    // var radiusMeters = getMeters(radiusMiles);
    // Yelp takes radius in meters

    yelpURL += "?" + $.param({
        "term": term,
        "latitude": midpoint.lat,
        "longitude": midpoint.lng,
        "limit": 10
        // "distance": radiusMeters //not sure if this works properly; check again later
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

                createMarker(yLat, yLng, yContent);


                $("#yelp-results").append("<tr><td>" + businessName + "</td></td><td>" + businessAddress + "</td><td><a href='" + yelpLink + "' target='_blank'>Go to Yelp Page</a></td></tr>");
            }
        });
    }).fail(function(err) {
        console.error(err)
    });

  }


// GEOCODE-----------------------------------------------------------------------------------

var startLocField = $(document.getElementById("input-start-location"));

function pushUserStartLocToFB(k) {

    var geocodeURL = "/api/geocode";
    var address = startLocField.val();
    var geocodeKey = "AIzaSyBDX_eXekJVgS9WjggIhZRQbvNXlbFQDsc";

    geocodeURL += "?" + $.param({
        "api_key": geocodeKey,
        "address": address
    });

    $.ajax({
        url: geocodeURL,
        method: "GET"
    }).done(function(response) {
        console.log(response);
        var startAddress = response.results[0].formatted_address;
        var startLat = response.results[0].geometry.location.lat;
        var startLng = response.results[0].geometry.location.lng;

        database.ref("groups/" + k + "/members/" + auth.currentUser.displayName).set({
          startAddress: startAddress,
          startLat: startLat,
          startLng: startLng
        });

        loadPage.profile();
    }).fail(function(err) {
        console.error(err)
    });
}

  var startLocModal = $(document.getElementById("modal-start-location"));
  var submitStartLoc = $(document.getElementById("btn-start-location"));
  var closeStartLoc = $(document.getElementById("close-start-location"));

 $(document).on("click", ".group-icon-edit", function(e) {
    e.preventDefault();
    startLocModal.css("display", "block");
    var gKey = ($(this).attr("data-value"));
    database.ref("groups/" + gKey + "/place").on("value", function(snapPlace) {
      var searchTerm = snapPlace.val();
    });

    submitStartLoc.on("click", function(e){
      e.preventDefault();
      startLocModal.css("display", "none");
      pushUserStartLocToFB(gKey);
    })

  
  });

 closeStartLoc.on("click", function(e) {
  e.preventDefault();
  startLocModal.css("display", "none");
 });

// USE CURRENT LOCATION================================================================================
function getLocation() {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(showPosition); //Calls the showPosition if geolocation supported
   } else {
       startLocField.val(startLocField.val() + "Geolocation is not supported by this browser.");
   }
}

function showPosition(position) { // Reverse geocoding - returns address from current location
   var currentLat = position.coords.latitude;
   var currentLng = position.coords.longitude;

   var geocoder = new google.maps.Geocoder();             // create a geocoder object
   var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);    // turn coordinates into an object          
   geocoder.geocode({'latLng': location}, function (results, status) {
   if(status == google.maps.GeocoderStatus.OK) {           // if geocode success
      var address = results[0].formatted_address;         // if address found, pass to processing function
      startLocField.val(startLocField.val() + address); //writes the address in the input field
    }
  })
 }

 $("#btn-current-loc").on("click", function(e) {
  e.preventDefault();
  startLocField.val("");
  getLocation();
 })


});