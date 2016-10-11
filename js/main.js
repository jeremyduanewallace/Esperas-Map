alert("hello");

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hmaXNoYnVybiIsImEiOiJjaWs2dHB0cXQwMHdqaHJtMjJ6ejVra2R0In0.Gfuf4QMy6U0MfG1fDddZvQ';

let regions = [];
let states = [];
let pois =[];

// Mapbox
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-98.5795, 39.8282],
  minZoom: 3
});

// Setup Esperas authorization header.
const esperasHeaders = new Headers({
  Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBfbWV0YWRhdGEiOnsicm9sZXMiOlsiYWRtaW4iXX0sImlzcyI6Imh0dHBzOi8vYXBwNDcyMzI5NTIuYXV0aDAuY29tLyIsInN1YiI6ImZhY2Vib29rfDEwMjA3MTUwNTYxODYwMjM3IiwiYXVkIjoibzB2V1pXZXJPMW93ejNzVlFBOUdsVmt2VTZ3WGJ2ZzUiLCJleHAiOjE0OTEwNjMwNTYsImlhdCI6MTQ1OTUyNzA1Nn0.LPjw7Xq6XrnWf9y2vSBa3bk0USkjwMakIbU_CZi0m9E',
});

loadVenues();

// Load Regions from Esperas.
function loadVenues() {
  fetch('http://poi.esperas.org/api/venues?size=200&status=published&format=geojson', {
    headers: esperasHeaders,
  })
  .then((response) => response.json())
  .then((response) => {
    // Add venues to map.
    addVenuesToMap(response);
  })
}

// Add Venues to map after load
function addVenuesToMap(venues) {
  map.on('load', function(e) {
    map.addSource("venuesSource", {
        type: "geojson",
        data: venues,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        
    });

    // Use the earthquakes source to create five layers:
    // One for unclustered points, three for each cluster category,
    // and one for cluster labels.

    map.addLayer({
      "id": "points",
      "type": "symbol",
      "source": "venuesSource",
      "layout": {
        "icon-image": "monument-15",
        "text-field": "{name}",
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 0.6],
        "text-anchor": "top",
        "marker-color": "#D1440A",
        "marker-size": 'large'
      }
    });

    // Display the earthquake data in three layers, each filtered to a range of
    // count values. Each range gets a different fill color.
    var layers = [
        [150, '#f28cb1'],
        [20, '#f1f075'],
        [0, '#51bbd6']
    ];

    layers.forEach(function (layer, i) {
       map.addLayer({
         "id": "cluster-" + i,
         "type": "circle",
         "source": "venuesSource",
         "paint": {
           "circle-color": layer[1],
           "circle-radius": 18
         },
         "filter": i === 0 ?
         [">=", "point_count", layer[0]] :
         ["all",
          [">=", "point_count", layer[0]],
          ["<", "point_count", layers[i - 1][0]]]
        });
      });

      // Add a layer for the clusters' count labels
      map.addLayer({
        "id": "cluster-count",
        "type": "symbol",
        "source": "venuesSource",
        "layout": {
          "text-field": "{point_count}",
          "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold",
          ],
          "text-size": 12
        }
    });
  })
}