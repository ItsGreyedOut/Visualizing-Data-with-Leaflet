// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get request to the earthquake.usgs.gov for earthquake data/
d3.json(queryUrl).then(function (data) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function bindPopuptoEarthquake(feature, layer) {
    layer.bindPopup(
      `<h3>Location: ${feature.properties.place}<br>Magnitude: ${
        feature.properties.mag
      }</h3><hr><p>${new Date(feature.properties.time)}</p>`
    );
  }
// Provide the Earthquake information
  function generateEarthquakeRadius(depth) {
    return Math.sqrt(depth / 3.1415);
  }
  // Color represents earthquake magnitude.  https://hihayk.github.io/scale/#6/7/61/78/58/22/9/14/42BCF6/29/250/100/white
  function generateEarthquakeColor(magnitude) {
    if (magnitude > 9.0) {
      return "#156431";
    }
    if (magnitude > 8.0) {
      return "1B7D4E";
    }
    if (magnitude > 7.0) {
      return "#2AAF9A";
    }
    if (magnitude > 6.0) {
      return "#31C7C7";
    }
    if (magnitude > 5.0) {
      return "#42BCF6";
    }
    if (magnitude > 4.0) {
      return "#56CCF8";
    }
    if (magnitude > 3.0) {
      return "#6ADBFA";
    }
    if (magnitude > 2.0) {
      return "#94F1FD";
    }
    if (magnitude > 1.0) {
      return "#A9F9FE";
    } else {
      return "#D4FFFD";
    }
  }


  // Add color and location coordinates to OpenStreetMap
  function generateEarthquakeStyle(feature) {
    console.log(feature);
    return {
      color: generateEarthquakeColor(feature.properties.mag),
      radius: generateEarthquakeRadius(feature.geometry.coordinates[2]),
    };
  }


  // Insert marker for each earthquake on OpenStreetMap
  function generateEarthquakeMarker(feature, layer) {
    return L.circleMarker(layer);
  }


  // Create a GeoJSON layer that contains the features array on the earthquakeData object from USGS.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: bindPopuptoEarthquake,
    style: generateEarthquakeStyle,
    pointToLayer: generateEarthquakeMarker,
  });
  console.log(earthquakes);


  // Create the base layers.
  var street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  var topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  let dark = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      accessToken: API_KEY,
    }
  );

  let satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      //call api key from config.js
      accessToken: API_KEY,
    }
  );

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map View": street,
    "Topographic Map View": topo,
        Satellite: satellite,
        Dark: dark,
  };

  // Create the map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [20.0, -4.0],
    zoom: 2,
    layers: [dark, earthquakes],
  });

  var tectonicPlates = new L.LayerGroup();

  d3.json(
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
  ).then(function (tectonicPlateData) {
    L.geoJson(tectonicPlateData).addTo(tectonicPlates);
    tectonicPlates.addTo(myMap);
    console.log(tectonicPlates);
  });

  // Create an overlay object to hold our overlay data.
  var overlayMaps = {

    // Add Tectonic Plates option to the map
    "Tectonic Plates": tectonicPlates,
    Earthquakes: earthquakes,
  };

  // Create a layer control and pass baseMapes and Overlaymaps
  // Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  // Create the legend for the Earthquake magnatitude.
  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0];
    var colors = [
      "#156431",
      "#1B7D4E",
      "#2AAF9A",
      "#31C7C7",
      "#42BCF6",
      "#56CCF8",
      "#6ADBFA",
      "#94F1FD",
      "#A9F9FE",
      "#D4FFFD",
    ];

    // Add the minimum and maximum.
    var legendInfo = `
      <h1>Magnitude and Depth of Earthquakes</h1>
      <div class="labels">
      <div class="min">
      ${limits[0]}
      </div>
      <div class="max">
      ${limits[limits.length - 1]}
      </div>
      </div>
      <ul>`;

    limits.forEach(function (limit, index) {
      legendInfo += '<li style="background-color: ' + colors[index] + '"></li>';
    });

    legendInfo += "</ul>";
    div.innerHTML = legendInfo;
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
});