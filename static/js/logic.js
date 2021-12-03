//Get earthquake data 
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// load API via d3
d3.json(earthquakeURL).then(data => {
    // send the data.features to createFeatures function
    createFeatures(data.features);
});

// define a function to set the size of each earthquake data point based on magnitude
function quakesize(mag) {
    //console.log(mag);
    if (mag == 0) {
     return 1;
    };
    if (mag != 0) {
        return mag * 10;
    };
};

// define a function to color each earthquake data point based on depth
function quakecolor(depth) {
    //console.log(depth);
    switch (true) {
    case depth > 90:
        return "red";
    case depth > 70:
        return "orangered";
    case depth > 50:
        return "orange";
    case depth > 30:
        return "gold";
    case depth > 10:
        return "yellow";
    default:
        return "lightgreen";
    };
};

//define a function to set the feature attributes on the map
function createFeatures(earthquakeData) {
  // create geoJSON layer containing the features array on the earthquakeData object
  var earthquakes =  L.geoJSON(earthquakeData, {
    pointToLayer: (feature, latlng) => {
    //console.log(latlng)
    return L.circleMarker(latlng, {
           radius: quakesize(feature.properties.mag),
           fillColor: quakecolor(feature.geometry.coordinates[2]),
           fillOpacity: 0.7,
           color: "black",
           stroke: true,
           weight: 1.5
    });
    },  
    onEachFeature : (feature, layer) => {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
  } 
);

 createMap(earthquakes);
};

// define a function to create the map layer(s), overlays, layer controls, legend
function createMap(earthquakes) {
    // define map layer
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layer
    var baseMaps = {
        "Street Map": streetmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [ 37.09, -95.71 ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // create layer control and add to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // add a legend to the map
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "Legend")
        var depths = [0, 10, 30, 50, 70, 90]

        for(var i = 1; i < depths.length; i++) {
            console.log(i);
            div.innerHTML += "<div><i style='background-color:" + quakecolor(depths[i]).toString() + ";'>"
                          + "&nbsp;</i>" + depths[i - 1] + " - " + depths[i]
                          + "</div>";
            console.log(div);
        };
        return div
    };
    legend.addTo(myMap);
};