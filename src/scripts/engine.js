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

// Modal alert
const modalAlert = document.querySelector(".modal-alert");
modalAlert.querySelector(".modal-close").addEventListener("click", () => {
  modalAlert.close();
});

// Array used to store layer group objects
const overlaysArray = [];

// New marker object
let newMarker = {
  markerID: "",
  markerName: "",
  coordinates: [],
  overlayName: "",
};

// New layer group object that is used to group markers into overlay
let newLayerGroup = {
  name: "",
  group: "",
};

// Function to create a new overlay
function addNewOverlay(overlayName) {
  if (!overlaysArray.some((overlay) => overlay.name === overlayName)) {
    let newLayerGroup = {
      name: overlayName,
      group: L.layerGroup([]).addTo(Worldmap),
    };
    layerControl.addOverlay(newLayerGroup.group, newLayerGroup.name);
    overlaysArray.push(newLayerGroup);
  }
}

// Marker list template
const markerListTemplate = document.querySelector("#sidebar-layer-template");

// Function to add an overlay and marker to the sidebar pane
function addToList(
  listContainer,
  overlayName,
  markerName,
  markerCoordinates,
  markerID,
  itemTemplate
) {
  let targetLayer = listContainer.querySelector(
    `.marker-list[data-layer-group="${overlayName}"]`
  );

  if (!targetLayer) {
    let newList = markerListTemplate.content.cloneNode(true);
    newList.querySelector(".marker-list-toggle").dataset.targetLayer = overlayName;
    newList.querySelector(".marker-list-toggle").textContent = overlayName;
    newList.querySelector(".marker-list").dataset.layerGroup = overlayName;
    listContainer.appendChild(newList);
    targetLayer = listContainer.querySelector(
      `.marker-list[data-layer-group="${overlayName}"]`
    );
  }

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

// Common class for both sidebar containers
const MarkersContainers = document.querySelectorAll(".marker-list-container");

// Event delegation to open marker lists in the sidebar pane
function openMarkerList(event) {
  let targetToggle = event.target.closest(".marker-list-toggle");
  if (!targetToggle) {
    return;
  }
  let container = targetToggle.closest(".list-container");
  let markerList = container.querySelector(".marker-list");
  markerList.classList.toggle("marker-list--open");
}

// Enable opening marker lists in the sidebar containers
MarkersContainers.forEach((container) => {
  container.addEventListener("click", openMarkerList);
});

// Clicking onto the marker link in the sidebar pane zooms onto it
function goToMarker(event, markersArray) {
  event.preventDefault();
  let markerLink = event.target.closest(".marker-link");
  if (!markerLink) {
    return;
  }
  let markerID = markerLink.dataset.markerId;
  let marker = markersArray.find((marker) => String(marker.markerID) === markerID);
  marker.mapMarker.openPopup();
  Worldmap.flyTo(marker.mapMarker.getLatLng(), 5);
}

const initialMarkers = []; // Array for storing markers fetched from the server
const initialMarkersContainer = document.querySelector(".initial-markers-container"); // Container for the markers fetched from the database/JSON file

initialMarkersContainer.addEventListener("click", (event) => goToMarker(event, initialMarkers));

// Markers fetched from the server/JSON file
const jsonUrl = "../markers.json"; // Link to the endpoint or JSON file

fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
  })
  .then((data) => {
    // Function to create a marker object from fetched data
    function createMarkerObject(markerID, markerName, coordinates, overlayName) {
      return {
        markerID,
        markerName,
        coordinates,
        overlayName,
      };
    }

    // Create new marker objects and add them to the array
    data.forEach((markerData) => {
      let initialMarker = createMarkerObject(
        markerData.markerID,
        markerData.markerName,
        markerData.coordinates,
        markerData.overlayName
      );
      initialMarkers.push(initialMarker);
      addNewOverlay(markerData.overlayName); // Create a new overlay from fetched data
    });

    // After fetching markers, add them to the map
    addInitialMarkers();
  })
  .catch((error) => {
    console.error(`Fetch error: ${error.message}`);
  });

// Adding markers to the map and sidebar pane
function addInitialMarkers() {
  initialMarkers.forEach((marker) => {
    let leafletMarker = L.marker(marker.coordinates); // Put the marker in corresponding coordinates
    let customPopupContent = `<div class="custom-popup">${marker.markerName}</div>`; // Add the custom popup with marker/location name
    leafletMarker.bindPopup(customPopupContent).openPopup(); // Bind the popup to the marker

    let targetLayer = overlaysArray.find((layer) => layer.name === marker.overlayName); // Find the overlay in the overlay array corresponding to the marker overlay
    if (targetLayer) {
      targetLayer.group.addLayer(leafletMarker); // Add the marker to the corresponding overlay
      marker.mapMarker = leafletMarker; // Bind object from the array to the marker on the map
      //console.log(`Marker added for ${marker.markerName}`); <-- For debugging purposes
    }
    // else {
    //   console.error(`Overlay not found for marker: ${marker.markerName}`); <-- For debugging purposes
    // }

    const listItemTemplate = document.querySelector("#sidebar-marker-template--initial"); // List item template for the new marker
    // Add the marker to the sidebar pane
    addToList(
      initialMarkersContainer,
      marker.overlayName,
      marker.markerName,
      marker.coordinates,
      marker.markerID,
      listItemTemplate
    );
  });
}

// Functionality for overall stuff
const checkpointMenuToggle = document.querySelector(".checkpoint-menu-toggle");
checkpointMenuToggle.addEventListener("click", () => {
  let checkpointMenu = document.querySelector(".checkpoint-menu");
  checkpointMenu.classList.toggle("menu--active");
});

const closeCheckpoint = document.querySelector(".close__checkpoint");
closeCheckpoint.addEventListener("click", () => {
  closeCords(Cords);
});

const openCheckpoint = document.querySelector(".open__checkpoint");
openCheckpoint.addEventListener("click", () => {
  Cords.addTo(Worldmap);
});

const exportMenuToggle = document.querySelector(".export-menu-toggle");
exportMenuToggle.addEventListener("click", () => {
  const exportMenu = document.querySelector(".export-menu");
  exportMenu.classList.toggle("menu--active");
});

const customMarkers = [];
const uniqueNames = new Set();
const uniqueCoordinates = new Set();

function getCords(get) {
  let latLng = get.getLatLng();
  let formattedLat = latLng.lat.toFixed(2);
  let formattedLng = latLng.lng.toFixed(2);
  return [formattedLat, formattedLng];
}

function closeCords(e) {
  e.remove();
  e.setLatLng([0, 0]);
}

function rescan() {
  uniqueNames.forEach(name => {
    if (!customMarkers.some(marker => marker.markerName === name)) {
      uniqueNames.delete(name);
    }
  });
}

let Cords = L.marker([0, 0], {
  icon: redIcon,
  draggable: true,
  zIndexOffset: 9998,
});

const checkpointPopupTemplate = document.querySelector("#checkpoint-popup-template");

Cords.bindPopup("");
Cords.openPopup("");

Cords.on("dragend", () => {
  let coordinates = getCords(Cords);
  let checkpoint = checkpointPopupTemplate.content.cloneNode(true);
  checkpoint.querySelector(".checkpoint-coordinates").textContent = coordinates;
  checkpoint.querySelector(".addMarker").addEventListener("click", () => {
    addMarker();
  });
  checkpoint.querySelector(".closeCords").addEventListener("click", () => {
    closeCords(Cords);
  });
  Cords.getPopup().setContent(checkpoint).openOn(Worldmap);
});

let markerID = 0;

function newID() {
  markerID++;
}

const customMarkersContainer = document.querySelector(".custom-markers-container");

customMarkersContainer.addEventListener("click", (event) => goToMarker(event, customMarkers));

customMarkersContainer.addEventListener("click", function Rename(event) {
  event.preventDefault();

  let rename = event.target.closest(".marker-rename");
  let modal = document.querySelector(".modal-rename");
  let required = modal.querySelector(".name-required-modal");
  let closeModal = modal.querySelector(".modal-close");

  closeModal.addEventListener("click", () => {
    modal.close();
    required.classList.remove("name-required-modal--active");
    document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active");
    modal.querySelector(".modal-input").value = "";
  });

  if (rename) {
    let listItem = rename.closest(".marker-list-item");
    let markerLink = listItem.querySelector(".marker-link");
    let markerID = markerLink.dataset.markerId;
    let markerToRename = customMarkers.find((marker) => String(marker.markerID) === markerID);
    let modalInput = modal.querySelector(".modal-input");
    let oldName = markerToRename.markerName;

    modal.showModal();

    let acceptName = modal.querySelector(".modal-accept");

    function handleNameChange() {
      let newName = modalInput.value.trim();
      if (newName === "") {
        required.classList.add("name-required-modal--active");
        return;
      }
      newName = capitalize(newName);
      if (uniqueNames.has(newName)) {
        document.querySelector(".name-exists-modal").classList.add("name-exists-modal--active");
        return;
      }
      uniqueNames.delete(oldName);
      uniqueNames.add(newName);
      markerToRename.markerName = newName;
      markerLink.textContent = newName;
      let customPopupContent = `<div class="custom-popup">${newName}</div>`;
      markerToRename.mapMarker.bindPopup(customPopupContent).openPopup();
      modal.close();
      modalInput.value = "";
      document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active");

      acceptName.removeEventListener("click", handleNameChange);
    }

    acceptName.addEventListener("click", handleNameChange);
  }
  rescan();
});

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
    let markerToDelete = customMarkers.find((marker) => String(marker.markerID) === markerID);
    let name = markerToDelete.markerName;
    let overlay = overlaysArray.find((layerGroup) => String(layerGroup.name) === listItem.dataset.layer);
    let layerGroup = overlay.group;

    modal.showModal();

    function checkGroup() {
      if (layerGroup.getLayers().length === 0) {
        let indexOverlay = overlaysArray.indexOf(overlay);
        if (indexOverlay !== -1) {
          overlaysArray.splice(indexOverlay, 1);
          layerControl.removeLayer(layerGroup);
        }
      }
    }

    function removeItem() {
      if (list.contains(listItem)) {
        layerGroup.removeLayer(markerToDelete.mapMarker);
        list.removeChild(listItem);
        let indexMarker = customMarkers.indexOf(markerToDelete);
        uniqueNames.delete(name);
        customMarkers.splice(indexMarker, 1);
      }
      if (list.children.length === 0) {
        if (customMarkersContainer.contains(listContainer)) {
          customMarkersContainer.removeChild(listContainer);
        }
      }
      modal.close();
      checkGroup();
    }

    modalTake.addEventListener("click", removeItem);
    modalDrop.addEventListener("click", () => {
      modal.close();
      return;
    });
  }
});

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function addMarker() {
  let markerName = document.querySelector(".markerName").value.trim();
  markerName = capitalize(markerName);
  let overlayName = document.querySelector(".overlayName").value.trim();
  overlayName = capitalize(overlayName);

  if (markerName === "") {
    let fieldRequired = document.querySelector(".name-required");
    let inputName = document.querySelector(".markerName");
    fieldRequired.classList.toggle("name-required--active");
    inputName.classList.toggle("input-required");
    return;
  }

  if (overlayName === "") {
    let fieldRequired = document.querySelector(".layer-required");
    fieldRequired.classList.toggle("layer-required--active");
    let inputOverlay = document.querySelector(".overlayName");
    inputOverlay.classList.toggle("input-required");
    return;
  }

  let markerCoordinates = getCords(Cords);

  if (uniqueNames.has(markerName) || uniqueCoordinates.has(markerCoordinates)) {
    modalAlert.querySelector(".modal-alert-title").textContent = "Marker name already exists";
    modalAlert.showModal();
    return;
  }

  newID();
  uniqueNames.add(markerName);
  uniqueCoordinates.add(markerCoordinates);
  addNewOverlay(overlayName);

  newMarker = {
    markerID: markerID,
    markerName: markerName,
    coordinates: markerCoordinates,
    overlayName: overlayName,
  };
  customMarkers.push(newMarker);

  let marker = L.marker(markerCoordinates, { icon: greenIcon });
  let customPopupContent = `<div class="custom-popup">${markerName}</div>`;
  marker.bindPopup(customPopupContent).openPopup();
  newMarker.mapMarker = marker;

  let targetLayer = overlaysArray.find((layer) => layer.name === overlayName);
  targetLayer.group.addLayer(marker);

  const customItem = document.querySelector("#sidebar-marker-template--custom");

  addToList(customMarkersContainer, overlayName, markerName, markerCoordinates, markerID, customItem);
}

const exportJSONfile = document.querySelector(".export-json").addEventListener("click", function () {
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

const exportTextFile = document.querySelector(".export-txt").addEventListener("click", function () {
  if (customMarkers.length > 0) {
    let markerData = customMarkers.map((marker) => {
      let { markerName, coordinates, overlayName } = marker;
      return `('${markerName}', '${coordinates[0]}', '${coordinates[1]}', '${overlayName}'),`;
    });

    const resultString = markerData.join("\n");
    const txtBlob = new Blob([resultString], { type: "text/plain" });

    const url = URL.createObjectURL(txtBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "markers.txt";
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

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded Successfully");
});