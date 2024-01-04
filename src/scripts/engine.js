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

// custom icons, you can create your own icons and link them here
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
  .querySelector(".checkpoint-menu-toggle") //button in the custom-markers pane in sidebar
  .addEventListener("click", () => {
    let checkpointMenu = document.querySelector(".checkpoint-menu");
    checkpointMenu.classList.toggle("menu--active");
  });

let closeCheckpoint = document
  .querySelector(".close__checkpoint") //close red marker checkpoint
  .addEventListener("click", () => {
    closeCords(Cords);
  });
let openCheckpoint = document
  .querySelector(".open__checkpoint") //add red marker checkpoint
  .addEventListener("click", () => {
    Cords.addTo(Worldmap);
  });

document.querySelector(".export-menu-toggle").addEventListener("click", () => {
  //export menu, export functions at the bottom of the file
  let exportMenu = document.querySelector(".export-menu");
  exportMenu.classList.toggle("menu--active");
});

let modalAlert = document.querySelector(".modal-alert");
modalAlert.querySelector(".modal-close").addEventListener("click", () => {
  modalAlert.close();
});

//End of the Functionality section

//Leaflet stuff
var worldMarkers = []; //array for storing markers fetched from the server
var customMarkers = []; //array for storing markers created in browser
var overlaysArray = []; //array used to store layergroup objects
//new marker object used to create new markers
var newMarker = {
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
//get the coordinates from checkpoint position
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
//simple unique ID for markers
var markerID = 0;
function newID() {
  markerID++;
}
//function to create new overlay
function addNewOverlay(overlayName) {
  if (!overlaysArray.some((overlay) => overlay.name === overlayName)) {
    //create new layer group object if it doesn't exist
    let newLayerGroup = {
      name: overlayName,
      group: L.layerGroup([]).addTo(Worldmap),
    };
    layerControl.addOverlay(newLayerGroup.group, newLayerGroup.name); //add layergroup object/overlay to layer control
    overlaysArray.push(newLayerGroup); //add layergroup object/overlay to an array
  }
}
const markerListTemplate = document.querySelector("#sidebar-layer-template");

// add an overlay and marker to the sidebar pane
function addToList(
  listContainer, //where the list will be placed
  overlayName,
  markerName,
  markerCoordinates,
  markerID,
  itemTemplate
) {
  let targetLayer = listContainer.querySelector(
    `.marker-list[data-layer-group="${overlayName}"]`
  );

  // check if there already exists an overlay in the container with given name if not create it
  if (!targetLayer) {
    let newList = markerListTemplate.content.cloneNode(true);
    newList.querySelector(".list-container").dataset.layer = overlayName;
    newList.querySelector(".marker-list-toggle").dataset.targetLayer =
      overlayName;
    newList.querySelector(".marker-list-toggle").textContent = overlayName;
    newList.querySelector(".marker-list").dataset.layerGroup = overlayName;
    listContainer.appendChild(newList);
    targetLayer = listContainer.querySelector(
      `.marker-list[data-layer-group="${overlayName}"]`
    );
  }

  //create new list element that is new marker
  let newlistItem = itemTemplate.content.cloneNode(true);
  newlistItem.querySelector(".marker-list-item").dataset.layer = overlayName;
  newlistItem.querySelector(".marker-link").dataset.markerId = markerID;
  newlistItem.querySelector(".marker-link").textContent = markerName;
  let [lat, lng] = markerCoordinates;
  newlistItem.querySelector(
    ".marker-info"
  ).textContent = `Lat: ${lat}, Lng: ${lng}`;

  targetLayer.appendChild(newlistItem);
}

const baseMarkersContainer = document.querySelector(".base-markers-container"); //container for the markers fetched from database/JSON file
const customMarkersContainer = document.querySelector(
  ".custom-markers-container"
); //container for the markers created by the user
const MarkersContainers = document.querySelectorAll(".marker-list-container"); //common class for both of the above containers

//event deegation to open marker lists in the sidebar pane
function handleToggleClick(event) {
  let targetToggle = event.target.closest(".marker-list-toggle");
  if (targetToggle) {
    let container = targetToggle.closest(".list-container");
    let markerList = container.querySelector(".marker-list");
    markerList.classList.toggle("marker-list--open");
  }
}

//add event delegation listener to both of the containers
MarkersContainers.forEach((container) => {
  container.addEventListener("click", handleToggleClick);
});

/*
When clicked on the link with marker name in the sidebar, map gets zoomed onto the corresponding marker.
Separate function for both of the containers because of the two separate array of the markers.
First for the markers fetched from the server/JSON file, second one for user created markers.
*/
baseMarkersContainer.addEventListener("click", function GoTo(event) {
  event.preventDefault();
  let markerLink = event.target.closest(".marker-link");
  if (markerLink) {
    let markerID = markerLink.dataset.markerId;
    let marker = worldMarkers.find(
      (marker) => String(marker.markerID) === markerID
    );
    if (marker && marker.mapMarker) {
      marker.mapMarker.openPopup();
      Worldmap.flyTo(marker.mapMarker.getLatLng(), 5);
    }
  }
});
customMarkersContainer.addEventListener("click", function GoTo(event) {
  event.preventDefault();
  let markerLink = event.target.closest(".marker-link");
  if (markerLink) {
    let markerID = markerLink.dataset.markerId;
    let marker = customMarkers.find(
      (marker) => String(marker.markerID) === markerID
    );
    if (marker && marker.mapMarker) {
      marker.mapMarker.openPopup();
      Worldmap.flyTo(marker.mapMarker.getLatLng(), 5);
    }
  }
});

// Rename function for the custom markers
customMarkersContainer.addEventListener("click", function Rename(event) {
  event.preventDefault();
  let modal = document.querySelector(".modal-rename");
  let required = modal.querySelector(".name-required-modal");
  let closeModal = modal.querySelector(".modal-close");
  closeModal.addEventListener("click", () => {
    modal.close();
    required.classList.remove("name-required-modal--active");
    document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active");
    modal.querySelector(".modal-input").value = "";
  });
  let acceptName = document.querySelector(".modal-accept");

  let rename = event.target.closest(".marker-rename");
  if (rename) {
    let listItem = rename.closest(".marker-list-item");
    let markerLink = listItem.querySelector(".marker-link");
    let markerID = markerLink.dataset.markerId;
    let marker = customMarkers.find(
      (marker) => String(marker.markerID) === markerID
    );
    let oldName = marker.markerName;
    modal.showModal();
    acceptName.addEventListener("click", () => {
      let modalInput = modal.querySelector(".modal-input").value.trim();
      if (modalInput === "") {
        required.classList.add("name-required-modal--active");
        return;
      }
      let newName = modalInput;
      newName = newName.charAt(0).toUpperCase() + newName.slice(1);
      if (uniqueNames.has(newName)) {
       document.querySelector(".name-exists-modal").classList.add("name-exists-modal--active");
       return;
      }
      uniqueNames.delete(oldName);
      marker.markerName = newName;
      markerLink.textContent = newName;
      let customPopupContent = `<div class="custom-popup">${newName}</div>`; //create custom popup with new marker name
      marker.mapMarker.bindPopup(customPopupContent).openPopup();
      uniqueNames.add(newName);
      modal.close();
      modal.querySelector(".modal-input").value = "";
      document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active");
    });
  }
});

//Delete function for custom markers
customMarkersContainer.addEventListener("click", function removeMarker(event) {
  event.preventDefault();
  let markerDelete = event.target.closest(".marker-delete");
  let modal = document.querySelector(".modal-delete");
  let modalTake = modal.querySelector(".modal-take-action");
  let modalDrop = modal.querySelector(".modal-drop-action");

  if (markerDelete) {
    let listItem = markerDelete.closest(".marker-list-item");
    let listContainer = listItem.closest(".list-container");
    let markerLink = listItem.querySelector(".marker-link");
    let markerID = markerLink.dataset.markerId;
    let list = listContainer.querySelector(".marker-list");
    let marker = customMarkers.find((marker) => String(marker.markerID) === markerID);
    let name = marker.markerName;
    modal.showModal();

    modalTake.addEventListener("click", () => {
      if (list.contains(listItem)){
        marker.mapMarker.remove();
        list.removeChild(listItem);
        let index = customMarkers.indexOf(marker);
        uniqueNames.delete(name);
        customMarkers.splice(index, 1);
      }
      if (list.children.length === 0) {
        if (customMarkersContainer.contains(listContainer)) {
          customMarkersContainer.removeChild(listContainer);
        }
        
      }

      modal.close();
    });
    modalDrop.addEventListener("click", () => {
      modal.close();
      return;
    });
  }
});

//Create new marker from input in checkpoint (red) marker
function addMarker() {
  let markerName = document.querySelector(".markerName").value.trim();
  markerName = markerName.charAt(0).toUpperCase() + markerName.slice(1);
  let overlayName = document.querySelector(".overlayName").value.trim();
  overlayName = overlayName.charAt(0).toUpperCase() + overlayName.slice(1);
  addNewOverlay(overlayName);

  if (markerName === "") {
    let fieldRequired = document.querySelector(".name-required");
    let inputName = document.querySelector(".markerName");
    fieldRequired.classList.toggle("name-required--active");
    inputName.classList.toggle("input-required");
    return; // Exit the function without adding a marker
  }

  // Check if the overlayName is not blank or just whitespace
  if (overlayName === "") {
    let fieldRequired = document.querySelector(".layer-required");
    fieldRequired.classList.toggle("layer-required--active");
    let inputOverlay = document.querySelector(".overlayName");
    inputOverlay.classList.toggle("input-required");
    return; // Exit the function without adding a marker and overlay
  }

  let markerCoordinates = getCords(Cords);
  // Check if the name and coordinates are unique
  if (uniqueNames.has(markerName) || uniqueCoordinates.has(markerCoordinates)) {
    modalAlert.querySelector(".modal-alert-title").textContent =
      "Marker name already exists";
    modalAlert.showModal();
    return; // Exit the function without adding a duplicate marker
  }

  newID(); //increase ID by one, it keeps the ID unique
  uniqueNames.add(markerName); //add marker name to unique names set
  uniqueCoordinates.add(markerCoordinates); //add marker coordinates to unique coordinates set
  // Create a new marker object from input
  newMarker = {
    markerID: markerID,
    markerName: markerName,
    coordinates: markerCoordinates,
    overlayName: overlayName,
  };
  customMarkers.push(newMarker); //add new marker object to the array

  // Create a green icon marker and store it in the markers object
  let marker = L.marker(markerCoordinates, { icon: greenIcon });
  let customPopupContent = `<div class="custom-popup">${markerName}</div>`; //create custom popup with marker name
  marker.bindPopup(customPopupContent).openPopup();
  newMarker.mapMarker = marker; //bind marker fromn the map to the corresponding object in array
  let targetLayer = overlaysArray.find((layer) => layer.name === overlayName); //find a layer in an array with the same input layer
  targetLayer.group.addLayer(marker); //add the marker to the layergroup of the target layer
  var listContainer = document.querySelector(".custom-markers-container");
  const customItem = document.querySelector("#sidebar-marker-template--custom");

  //add the marker and overlay if it doesn`t already exist to the sidebar pane
  addToList(
    listContainer,
    overlayName,
    markerName,
    markerCoordinates,
    markerID,
    customItem
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

Cords.bindPopup(""); //bind popup to the checkpoint (red) marker
Cords.openPopup(""); //open the popup
//at the end of drag action of the checkpoint marker
Cords.on("dragend", () => {
  let coordinates = getCords(Cords);
  let checkpoint = checkpointPopupTemplate.content.cloneNode(true); //clone template from HTML
  checkpoint.querySelector(".checkpoint-coordinates").textContent = coordinates; //display coordinates of the checkpoint
  checkpoint.querySelector(".addMarker").addEventListener("click", () => {
    addMarker(); //create new marker object
  });
  checkpoint.querySelector(".closeCords").addEventListener("click", () => {
    closeCords(Cords); //close checkpoint without doing anything
  });
  Cords.getPopup().setContent(checkpoint).openOn(Worldmap);
});

//Function for exporting custom markers to JSON file
document.querySelector(".export-json").addEventListener("click", function () {
  if (customMarkers.length > 0) {
    let markerData = customMarkers.map((marker) => {
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
    modalAlert.querySelector(".modal-alert-title").textContent =
      "There are no markers to export";
    modalAlert.showModal();
  }
});

//function for exporting custom markers to txt file, formatted to be directly used in INSERt statement in database
document.querySelector(".export-txt").addEventListener("click", function () {
  if (customMarkers.length > 0) {
    // Create an array of formatted strings for each marker
    let markerData = customMarkers.map((marker) => {
      let { markerName, coordinates, overlayName } = marker;
      return `('${markerName}', '(${coordinates[0]})', '(${coordinates[1]})', '${overlayName}'),`;
    });

    // Join the formatted strings into a single string
    const resultString = markerData.join("\n");

    // Create a Blob containing the text data
    const txtBlob = new Blob([resultString], { type: "text/plain" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(txtBlob);

    // Create a link to the URL and trigger a click event to download the text file
    const a = document.createElement("a");
    a.href = url;
    a.download = "markers.txt";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Release the URL
    window.URL.revokeObjectURL(url);

    // Remove the link element
    document.body.removeChild(a);
  } else {
    modalAlert.querySelector(".modal-alert-title").textContent =
      "There are no markers to export";
    modalAlert.showModal();
  }
});
//end of export function
//end of the custom markers section

// Markers fetched from the server/JSON file
const jsonUrl = "../markers.json"; //link to the endpoint or JSON file
fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
  })
  .then((data) => {
    // get those information from response
    function createObject(markerID, markerName, coordinates, overlayName) {
      return {
        markerID,
        markerName,
        coordinates,
        overlayName,
      };
    }
    //create new marker object and add it to the array
    data.forEach((marker) => {
      var baseMarker = createObject(
        marker.markerID,
        marker.markerName,
        marker.coordinates,
        marker.overlayName
      );
      worldMarkers.push(baseMarker);
      addNewOverlay(marker.overlayName); //Create new overlay from fetched data
    });

    // After fetching markers, add them to the map
    addBaseMarkers();
  })
  .catch((error) => {
    console.error(`Fetch error: ${error.message}`);
  });

// adding markers to the map and sidebar pane
function addBaseMarkers() {
  const listContainer = document.querySelector(".base-markers-container"); //sidebar pane container for fetched markers

  worldMarkers.forEach((marker) => {
    let leafletMarker = L.marker(marker.coordinates); //put the marker in corresponding coordinates
    let customPopupContent = `<div class="custom-popup">${marker.markerName}</div>`; //add the custom popup with marker/location name
    leafletMarker.bindPopup(customPopupContent).openPopup(); //bind the popup to the marker

    let targetLayer = overlaysArray.find(
      (layer) => layer.name === marker.overlayName //find the overlay in the overlay array corresponding to the marker overlay
    );
    if (targetLayer) {
      targetLayer.group.addLayer(leafletMarker); //add marker to the cooresponding overlay
      marker.mapMarker = leafletMarker; //bind object from array to the marker on the map
      //console.log(`Marker added for ${marker.markerName}`); <-- for debuging purposes
    }
    // else {
    //   console.error(`Overlay not found for marker: ${marker.markerName}`); <-- for debuging purposes
    // }
    const listItemTemplate = document.querySelector(
      "#sidebar-marker-template--base"
    ); //list item template for the new marker
    //add the marker to the sidebar pane
    addToList(
      listContainer,
      marker.overlayName,
      marker.markerName,
      marker.coordinates,
      marker.markerID,
      listItemTemplate
    );
  });
}

//if this function shows up in the console everything works fine
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded Successfully");
});
