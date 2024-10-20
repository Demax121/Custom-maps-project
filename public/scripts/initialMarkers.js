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
    function createMarkerObject(markerID, markerName, coordinates, overlayName, description) {
      return {
        markerID,
        markerName,
        coordinates,
        overlayName,
        description,
      };
    }

    // Create new marker objects and add them to the array
    data.forEach((markerData) => {
      let initialMarker = createMarkerObject(
        markerData.markerID,
        markerData.markerName,
        markerData.coordinates,
        markerData.overlayName,
        markerData.description
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


let locationName = document.querySelector(".location-name");
let descContainer =  document.querySelector(".location-description-container");
let sidebarState = document.querySelector("#sidebar");

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
    leafletMarker.addEventListener('click', () => {
      let desc = initialMarkers.find((element) => element.markerName === marker.markerName);
    
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
