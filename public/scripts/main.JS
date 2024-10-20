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








document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded Successfully");
});


