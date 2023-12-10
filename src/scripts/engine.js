var mapPath = "../maps/test/{z}/{y}/{x}.webp"; //link to map tiles

//setting up the map layer
var fullmap = L.tileLayer(mapPath, {
  minZoom: 0,
  maxZoom: 5,
  continuousWorld: false,
  noWrap: true,
});

//initializing the map
var Worldmap = L.map("map", {
  layers: [fullmap],
  zoomSnap: 0.25,
  zoomControl: false,
}).setView([0, 0], 2);

//adding zoom controlsto the topright corner
L.control
  .zoom({
    position: "topright",
  })

  .addTo(Worldmap);

//initializing sidebar
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
document
  .querySelector(".checkpoint-menu-toggle")
  .addEventListener("click", () => {
    var checkpointMenu = document.querySelector(".checkpoint-menu");
    var icon = document.querySelector(".checkpoint-menu-icon");
    checkpointMenu.classList.toggle("checkpoint-menu-active");
    icon.classList.toggle("flip-icon");
  });

var closeCheckpoint = document
  .querySelector(".close__checkpoint")
  .addEventListener("click", () => {
    closeCords(Cords);
  });
var openCheckpoint = document
  .querySelector(".open__checkpoint")
  .addEventListener("click", () => {
    Cords.addTo(Worldmap);
  });

//End of the Functionality section

//Leaflet stuff
let worldMarkers = []; //array for the default markers earlier added using JSON or fetched from database
let markersArray = []; //array to store markers
let overlaysArray = []; //array used to store layergroup objects
//new marker object used to create new markers
let newMarker = {
  markerID: "",
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
function newID() {
  markerID++;
}
//function to create new overlay
function addNewOverlay(overlayName) {
  if (!overlaysArray.some((overlay) => overlay.name === overlayName)) {
    //create new layer group object if it doesn't exist
    const newLayerGroup = {
      name: overlayName,
      group: L.layerGroup([]).addTo(Worldmap),
    };
    layerControl.addOverlay(newLayerGroup.group, newLayerGroup.name); //add layergroup object/overlay to layer control
    overlaysArray.push(newLayerGroup); //add layergroup object/overlay to an array
  }
}
const markerListTemplate = document.querySelector("#sidebar-layer-template");
const listItemTemplate = document.querySelector("#sidebar-marker-template");

function addToList(
  listContainer,
  overlayName,
  markerName,
  markerCoordinates,
  markerID
) {
  let targetLayer = listContainer.querySelector(
    `.marker-list[data-layer-group="${overlayName}"]`
  );

  if (!targetLayer) {
    const newList = markerListTemplate.content.cloneNode(true);
    newList.querySelector(".marker-list-toggle").dataset.targetLayer =
      overlayName;
    newList.querySelector(".marker-list-toggle").textContent = overlayName;
    newList.querySelector(".marker-list").dataset.layerGroup = overlayName;
    listContainer.appendChild(newList);
    targetLayer = listContainer.querySelector(
      `.marker-list[data-layer-group="${overlayName}"]`
    );
  }

  const newlistItem = listItemTemplate.content.cloneNode(true);
  newlistItem.querySelector(".marker-list-item").dataset.layer = overlayName;
  newlistItem.querySelector(".marker-link").dataset.markerid = markerID;
  newlistItem.querySelector(".marker-link").textContent = markerName;
  const [lat, lng] = markerCoordinates;
  newlistItem.querySelector(
    ".marker-info"
  ).textContent = `Lat: ${lat}, Lng: ${lng}`;

  targetLayer.appendChild(newlistItem);
}

const customMarkersContainers = document.querySelectorAll(
  ".marker-list-container"
);

function handleToggleClick(event) {
  let targetToggle = event.target.closest(".marker-list-toggle");
  if (targetToggle) {
    let container = targetToggle.closest(".list-container");
    let target = container.querySelector(".marker-list");
    target.classList.toggle("marker-list--open");
  }
}

customMarkersContainers.forEach((container) => {
  container.addEventListener("click", handleToggleClick);
});

//own markers section

function addMarker() {
  let markerName = document.querySelector(".markerName").value.trim();
  markerName = markerName.charAt(0).toUpperCase() + markerName.slice(1);

  let overlayName = document.querySelector(".overlayName").value.trim();
  overlayName = overlayName.charAt(0).toUpperCase() + overlayName.slice(1);
  addNewOverlay(overlayName);
  // Check if the markerName is not blank or just whitespace
  if (markerName === "") {
    alert("Provide a location name");
    return; // Exit the function without adding a marker
  }
  if (overlayName === "") {
    alert("Provide a layer name");
    return;
  }
  let markerCoordinates = getCords(Cords);
  // Check if the name and coordinates are unique
  if (uniqueNames.has(markerName) || uniqueCoordinates.has(markerCoordinates)) {
    alert("Marker name or coordinates already exist.");
    return; // Exit the function without adding a duplicate marker
  }

  newID(); //increase ID by one
  uniqueNames.add(markerName); //add marker name to unique names set
  uniqueCoordinates.add(markerCoordinates); //add marker coordinates to unique coordinates set
  // Create a new marker object from input
  newMarker = {
    markerID: markerID,
    markerName: markerName,
    coordinates: markerCoordinates,
    overlayName: overlayName,
  };
  markersArray.push(newMarker); //add new marker object to the array

  // Create a green icon marker and store it in the markers object
  const marker = L.marker(markerCoordinates, { icon: greenIcon });
  const customPopupContent = `<div class="custom-popup">${markerName}</div>`; //create custom popup with marker name
  marker.bindPopup(customPopupContent).openPopup();

  let targetLayer = overlaysArray.find((layer) => layer.name === overlayName); //find a layer in an array with the same input layer
  targetLayer.group.addLayer(marker); //add the marker to the layergroup of the target layer
  var listContainer = document.querySelector(".custom-markers-container");

  addToList(
    listContainer,
    overlayName,
    markerName,
    markerCoordinates,
    markerID
  );
}
//AddMarker function ends here

// Get the checkpoint marker that will be used to get coordinates
var Cords = L.marker([0, 0], {
  icon: redIcon,
  draggable: true,
  zIndexOffset: 9998,
});

const checkpointPopupTemplate = document.querySelector(
  "#checkpoint-popup-template"
);

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
      <label for="overlayName">Layer:</label>
      <br>
      <input type="text" class="overlayName" name="overlayName">
    </div>
    <br>
    <div class="row-three">
      <button type="button" onclick="addMarker()" class="cbtn">Add to list</button>
      <button type="button" onclick="closeCords(Cords)" class="cbtn">Close</button>
    </div>
  `;

  Cords.getPopup().setContent(popupContent).openOn(Worldmap);
});

//Function for exporting markers to JSON file
document.querySelector(".export").addEventListener("click", function () {
  if (markersArray.length > 0) {
    let markerData = markersArray.map((marker) => {
      let { markerName, coordinates, overlayName } = marker;
      return {
        markerName: markerName,
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

// Base markers section
const jsonUrl = "../markers.json";
fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
  })
  .then((data) => {
    function createObject(markerID, markerName, coordinates, overlayName) {
      return {
        markerID,
        markerName,
        coordinates,
        overlayName,
      };
    }
    data.forEach((marker) => {
      const baseMarker = createObject(
        marker.markerID,
        marker.markerName,
        marker.coordinates,
        marker.overlayName
      );
      worldMarkers.push(baseMarker);
      addNewOverlay(marker.overlayName);
    });

    // After fetching markers, add them to the map
    addBaseMarkers();
  })
  .catch((error) => {
    console.error(`Fetch error: ${error.message}`);
  });

function addBaseMarkers() {
  var listContainer = document.querySelector(".base-markers-container");

  worldMarkers.forEach((marker) => {
    // Assuming you want to create a Leaflet marker for each object in worldMarkers
    const leafletMarker = L.marker(marker.coordinates);
    const customPopupContent = `<div class="custom-popup">${marker.markerName}</div>`;
    leafletMarker.bindPopup(customPopupContent).openPopup();

    let targetLayer = overlaysArray.find(
      (layer) => layer.name === marker.overlayName
    );
    if (targetLayer) {
      targetLayer.group.addLayer(leafletMarker);
      //console.log(`Marker added for ${marker.markerName}`); <-- for debuging purposes
    }
    // else {
    //   console.error(`Overlay not found for marker: ${marker.markerName}`); <-- for debuging purposes
    // }
    addToList(
      listContainer,
      marker.overlayName,
      marker.markerName,
      marker.coordinates,
      marker.markerID
    );
  });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded Successfully");
});
