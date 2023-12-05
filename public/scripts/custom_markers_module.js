export function initializeOwnMarkers() {
    //own markers section

function addMarker() {
    let markerName = document.querySelector(".markerName").value.trim();
    let layerName = document.querySelector(".layerName").value.trim();
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
  }
  
  // Get the marker that will be used to get coordinates
  var Cords = L.marker([0, 0], {
    icon: redIcon,
    draggable: true,
    zIndexOffset: 9998
  });
  Cords.bindPopup("");
  Cords.openPopup("");
  Cords.on("dragend", () => {
    let coordinates = getCords(Cords);
    Cords.getPopup()
      .setContent(
        coordinates +
          "<br><br>" +
          ' <label for="markerName">Location name:</label>' +
          "<br>" +
          '<input type="text" class="markerName" name="markerName">' +
          "<br>" +
          ' <label for="layerName">Layer:</label>' +
          "<br>" +
          '<input type="text" class="layerName" name="layerName">' +
          "<br><br>" +
          ' <button type="button" onclick="addMarker()" class="cbtn">add to list</button>' +
          ' <button type="button" onclick="closeCords(Cords)" class="cbtn">Close coordinates</button>'
      )
      .openOn(Worldmap);
  });
  
  document.querySelector(".close").addEventListener("click", () => {
    closeCords(Cords); //close button for the marker from the sidebar
  });
  var getLoc = document.querySelector(".getLoc").addEventListener("click", () => {
    Cords.addTo(Worldmap);
  });
  //Getting coordinates ends here
    
  
    // Function for exporting markers to JSON file
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
    // End of export function
    // End of the own markers section
  }