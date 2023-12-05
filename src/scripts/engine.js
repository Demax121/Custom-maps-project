var mapPath = "../maps/test/{z}/{y}/{x}.webp";

var fullmap = L.tileLayer(mapPath, {
  minZoom: 0,
  maxZoom: 5,
  continuousWorld: false,
  noWrap: true,
});

var Worldmap = L.map("map", {
  layers: [fullmap],
  zoomSnap: 0.25,
  zoomControl: false,
}).setView([0, 0], 2);

L.control
  .zoom({
    position: "topright",
  })

  .addTo(Worldmap);

var sidebar = L.control.sidebar("sidebar").addTo(Worldmap);
var layerControl = L.control
  .layers(null, null, { collapsed: true })
  .addTo(Worldmap);


// Icons
var redIcon = new L.Icon({
  iconUrl: "../assets/markers/marker-icon-2x-red.png",
  shadowUrl: "../assets/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var greenIcon = new L.Icon({
  iconUrl: "../assets/markers/marker-icon-2x-green.png",
  shadowUrl: "../assets/markers/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
//end of custom icons

//Functionality for overall stuff

document.querySelector('.checkpoint-menu-toggle').addEventListener("click", ()=>{
  var checkpointMenu = document.querySelector('.checkpoint-menu');
  var icon = document.querySelector('.checkpoint-menu-icon');
  checkpointMenu.classList.toggle('checkpoint-menu-active');
  icon.classList.toggle('flip-icon');
});


var closeCheckpoint = document.querySelector(".close__checkpoint").addEventListener("click", () => {
  closeCords(Cords);
});


var openCheckpoint = document.querySelector(".open__checkpoint").addEventListener("click", () => {
  Cords.addTo(Worldmap);});



//End of the Functionality section



//Leaflet stuff
let worldMarkers=[]; //array for the default markers earlier added using JSON or fetched from database
let markersArray = []; //array to store markers
let layersArray = []; //array used to store layergroup objects
let layerLinksArray = []; //array used to store layer links for sidebar
//new marker object used to create new markers
let newMarker = {
  markerID:'',
  markerName: "",
  coordinates: [],
  overlayName: "",
};
//New layergroup object that is used to group markers into overlay
var newLayerGroup = {
  name: "",
  group: "",
};
var uniqueNames = new Set(); // Set to track unique names
var uniqueCoordinates = new Set(); // Set to track unique coordinates
//get the coordinates from marker position
function getCords(get) {
  let latLng = get.getLatLng();
  let formattedLat = latLng.lat.toFixed(2);
  let formattedLng = latLng.lng.toFixed(2);
  let Coordinates = [formattedLat, formattedLng];
  return Coordinates;
}
//remove marker for getting coordinates from the map
function closeCords(e) {
  e.remove();
  e.setLatLng([0, 0]);
}
//simpul ID for markers
let markerID = 0;
function newID(){
  markerID++;
}
//function to create new overlay
function addNewOverlay(layerName) {
  if (!layersArray.some((layer) => layer.name === layerName)) {
    //create new layer group object
    const newLayerGroup = {
      name: layerName,
      group: L.layerGroup([]).addTo(Worldmap),
    };
    layerControl.addOverlay(newLayerGroup.group, newLayerGroup.name); //add layergroup object/opverlay to layer control
    layersArray.push(newLayerGroup); //add layergroup object/opverlay to array
  }
}

const markerListTemplate = document.querySelector('#sidebar-layer-template');
const listItemTemplate = document.querySelector('#sidebar-marker-template');

function addToList(listContainer, layerName, markerName, markerCoordinates, markerID){

  if (layerLinksArray.includes(layerName) === false){
    const newList = markerListTemplate.content.cloneNode(true);
    newList.querySelector('.marker-list-toggle').dataset.targetLayer = layerName;
    newList.querySelector('.marker-list-toggle').textContent = layerName;
    newList.querySelector('.marker-list').dataset.layerGroup = layerName;
    listContainer.appendChild(newList);
    layerLinksArray.push(layerName);
  }

  const newlistItem = listItemTemplate.content.cloneNode(true);
  newlistItem.querySelector('.marker-list-item').dataset.layer=layerName;
  newlistItem.querySelector('.marker-link').dataset.markerid = markerID;
  newlistItem.querySelector('.marker-link').textContent = markerName;
  newlistItem.querySelector('.marker-info').textContent = "Coordinates: " + markerCoordinates;

  let targetLayer = document.querySelector('.marker-list');
  let markerLayer = newlistItem.querySelector('.marker-list-item');
  if (markerLayer.dataset.layer == targetLayer.dataset.layerGroup) {

    targetLayer.appendChild(newlistItem);
  }
}












//own markers section

function addMarker() {
  let markerName = document.querySelector(".markerName").value.trim();
  markerName = markerName.charAt(0).toUpperCase() + markerName.slice(1);
  
  let layerName = document.querySelector(".layerName").value.trim();
  layerName = layerName.charAt(0).toUpperCase() + layerName.slice(1);
  addNewOverlay(layerName);
  // Check if the markerName is not blank or just whitespace
  if (markerName === "") {
    alert("Provide a location name");
    return; // Exit the function without adding a marker
  }
  if (layerName === "") {
    alert("Provide a layer name");
    return;
  }
  let markerCoordinates = getCords(Cords);
  // Check if the name and coordinates are unique
  if (uniqueNames.has(markerName) || uniqueCoordinates.has(markerCoordinates)) {
    alert("Marker name or coordinates already exist.");
    return; // Exit the function without adding a duplicate marker
  }

  newID(); //increase ID by one simpul
  uniqueNames.add(markerName); //add marker name to unique names set
  uniqueCoordinates.add(markerCoordinates); //add marker coordinates to unique coordinates set
  // Create a new marker object from input
  newMarker = {
    markerID: markerID,
    markerName: markerName,
    coordinates: markerCoordinates,
    overlayName: layerName,
  };
  markersArray.push(newMarker); //add new marker object to the array

  let targetLayer = layersArray.find((layer) => layer.name === layerName); //find a layer in an array with the same input layer

  // Create a green icon marker and store it in the markers object
  markersArray[markerID] = L.marker(markerCoordinates, {
    icon: greenIcon,
  });
  const customPopupContent = `<div class="custom-popup">${markerName}</div>`;//create custom popup with marker name
  markersArray[markerID].bindPopup(customPopupContent).openPopup(); //add a popup to the marker and open it
  targetLayer.group.addLayer(markersArray[markerID]); //add the marker to the layergroup of the target layer


  
var listContainer = document.querySelector(".custom-markers-container");

addToList(listContainer, layerName, markerName, markerCoordinates, markerID);
}
//AddMarker function ends here


// Get the checkpoint marker that will be used to get coordinates
var Cords = L.marker([0, 0], {
  icon: redIcon,
  draggable: true,
  zIndexOffset: 9998
});

const checkpointPopupTemplate = document.querySelector("#checkpoint-popup-template");

Cords.bindPopup("");
Cords.openPopup("");
Cords.on("dragend", () => {
  const coordinates = getCords(Cords);
  const popupContent = `
    <span>${coordinates}</span>
    <div class="row-one">
      <label for="markerName">Location name:</label>
      <br>
      <input type="text" class="markerName" name="markerName">
    </div>
    <div class="row-two">
      <label for="layerName">Layer:</label>
      <br>
      <input type="text" class="layerName" name="layerName">
    </div>
    <br>
    <div class="row-three">
      <button type="button" onclick="addMarker()" class="cbtn">Add to list</button>
      <button type="button" onclick="closeCords(Cords)" class="cbtn">Close</button>
    </div>
  `;

  Cords.getPopup()
    .setContent(popupContent)
    .openOn(Worldmap);
});





//Function for exporting markers to JSON file
document.querySelector(".export").addEventListener("click", function () {
  if (markersArray.length > 0) {
    const markerData = markersArray.map(marker => {
      const { markerName, coordinates, overlayName } = marker;
      return {
        name: markerName,
        coordinates: coordinates,
        overlayName: overlayName,
      };
    });
    const jsonBlob = new Blob([JSON.stringify(markerData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(jsonBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "markers.json";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    alert("There are no markers to export.");
  }
});
//end of export function
//end of the own markers section



document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded Successfully");
  openList();
});
