
// Link to map tiles
const mapPath = "../maps/test/{z}/{y}/{x}.webp";

// Setting up the map layer
const fullmap = L.tileLayer(mapPath, {
  minZoom: 1,
  maxZoom: 5,
  continuousWorld: false,
  noWrap: true,
});

// Initializing the map
const Worldmap = L.map("map", {
  layers: [fullmap],
  zoomSnap: 0.25,
  zoomControl: false,
}).setView([0, 0], 2);

// Adding zoom controls to the top-right corner
L.control.zoom({position: "topright",}).addTo(Worldmap);
//Reset map view to the default zoom and coordinates
const viewReset = document.querySelector(".reset-view");
viewReset.addEventListener("click", (e) =>{
e.preventDefault();
Worldmap.setView([0, 0], 2);
});



// Initializing sidebar
const sidebar = L.control.sidebar("sidebar").addTo(Worldmap);
const layerControl = L.control
  .layers(null, null, { collapsed: true })
  .addTo(Worldmap);




// Custom icons
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `../assets/markers/${color}`,
  shadowUrl: `../assets/markers/marker-shadow.png`,
  iconSize: [35, 51],
  iconAnchor: [12, 50],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = createCustomIcon("marker-icon-red.png");

