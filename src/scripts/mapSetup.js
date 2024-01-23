
// Link to map tiles
const mapPath = "../maps/test/{z}/{y}/{x}.webp";

// Setting up the map layer
const fullmap = L.tileLayer(mapPath, {
  minZoom: 0,
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
L.control
  .zoom({
    position: "topright",
  })
  .addTo(Worldmap);

// Initializing sidebar
const sidebar = L.control.sidebar("sidebar").addTo(Worldmap);
const layerControl = L.control
  .layers(null, null, { collapsed: true })
  .addTo(Worldmap);

// Custom icons
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `../assets/markers/marker-icon-2x-${color}.png`,
  shadowUrl: "../assets/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = createCustomIcon("red");
const greenIcon = createCustomIcon("green");
