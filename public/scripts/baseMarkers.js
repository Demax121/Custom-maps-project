const baseMarkers = []; // Array for storing markers fetched from the server
const baseMarkersContainer = document.querySelector(".base-markers-container"); // Container for the markers fetched from the database/JSON file

baseMarkersContainer.addEventListener("click", (event) => goToMarker(event, baseMarkers));

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
    function createMarkerObject(markerID, markerName, coordinates, overlayName, description, markerIcon) {
      return {
        markerID,
        markerName,
        coordinates,
        overlayName,
        description,
        markerIcon,
      };
    }

    // Create new marker objects and add them to the array
    data.forEach((markerData) => {
      let baseMarker = createMarkerObject(
        markerData.markerID,
        markerData.markerName,
        markerData.coordinates,
        markerData.overlayName,
        markerData.description,
        markerData.markerIcon
      );
      baseMarkers.push(baseMarker);
      addNewOverlay(markerData.overlayName); // Create a new overlay from fetched data
    });

    // After fetching markers, add them to the map
    addbaseMarkers();
  })
  .catch((error) => {
    console.error(`Fetch error: ${error.message}`);
  });


let locationName = document.querySelector(".location-name");
let descContainer =  document.querySelector(".location-description-container");
let sidebarState = document.querySelector("#sidebar");

// Adding markers to the map and sidebar pane
function addbaseMarkers() {
  baseMarkers.forEach((marker) => {
    let leafletMarker = L.marker(marker.coordinates, {icon: createCustomIcon(marker.markerIcon)}); // Put the marker in corresponding coordinates
    let customPopupContent = `<div class="custom-popup">${marker.markerName}</div>`; // Add the custom popup with marker/location name
    leafletMarker.bindPopup(customPopupContent).openPopup(); // Bind the popup to the marker
    leafletMarker
    let targetLayer = overlaysArray.find((layer) => layer.name === marker.overlayName); // Find the overlay in the overlay array corresponding to the marker overlay
    if (targetLayer) {
      targetLayer.group.addLayer(leafletMarker); // Add the marker to the corresponding overlay
      marker.mapMarker = leafletMarker; // Bind object from the array to the marker on the map
      //console.log(`Marker added for ${marker.markerName}`); <-- For debugging purposes
    }
    // else {
    //   console.error(`Overlay not found for marker: ${marker.markerName}`); <-- For debugging purposes
    // }
    const listItemTemplate = document.querySelector("#sidebar-marker-template--base"); // List item template for the new marker
    // Add the marker to the sidebar pane
    addToList(
      baseMarkersContainer,
      marker.overlayName,
      marker.markerName,
      marker.coordinates,
      marker.markerID,
      listItemTemplate
    );
    leafletMarker.addEventListener('click', () => {
      let desc = baseMarkers.find((element) => element.markerName === marker.markerName);
    
      // Sprawdź, czy sidebar ma klasę "collapsed"
      if (sidebarState.classList.contains("collapsed")) {
        locationName.textContent = marker.markerName;
        descContainer.innerHTML = desc.description;
        sidebar.open('LocationDescription');
      
      // Jeśli sidebar nie jest collapsed i kliknięto inny marker
      } else if (!sidebarState.classList.contains("collapsed") && locationName.textContent != marker.markerName) {
        locationName.textContent = marker.markerName;
        descContainer.innerHTML = desc.description;
        sidebar.open('LocationDescription');
      
      // Jeśli sidebar nie jest collapsed i kliknięto ten sam marker
      } else if (!sidebarState.classList.contains("collapsed") && locationName.textContent === marker.markerName) {
        sidebar.close();
      }
    });
    
  });
}
