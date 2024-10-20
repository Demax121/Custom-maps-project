//Button to show menu for checkpoint marker
const checkpointMenuToggle = document.querySelector(".checkpoint-menu-toggle");
checkpointMenuToggle.addEventListener("click", () => {
  let checkpointMenu = document.querySelector(".checkpoint-menu");
  checkpointMenu.classList.toggle("menu--active");
});

//Remove checkpoint marker from map
const closeCheckpoint = document.querySelector(".close__checkpoint");
closeCheckpoint.addEventListener("click", () => {
  closeCords(Cords);
});

//Add checkpoint marker to map
const openCheckpoint = document.querySelector(".open__checkpoint");
openCheckpoint.addEventListener("click", () => {
  Cords.addTo(Worldmap);
});

//Button to show export menu for user created markers
const exportMenuToggle = document.querySelector(".export-menu-toggle");
exportMenuToggle.addEventListener("click", () => {
  const exportMenu = document.querySelector(".export-menu");
  exportMenu.classList.toggle("menu--active");
});

const customMarkers = []; //user created marker array
const uniqueNames = new Set(); //set for all marker names
const uniqueCoordinates = new Set(); //set for all marker coordinates

//get current position coordinates of the checkpoint marker
function getCords(get) {
  let latLng = get.getLatLng();
  let formattedLat = latLng.lat.toFixed(2);
  let formattedLng = latLng.lng.toFixed(2);
  return [formattedLat, formattedLng];
}
//remove checkpoint marker from map
function closeCords(e) {
  e.remove();
  e.setLatLng([0, 0]);
}
//create checkpoint marker
let Cords = L.marker([0, 0], {
  icon: redIcon, //icon for the checkpoint marker
  draggable: true,
  zIndexOffset: 9998,
});



/*
function to check if the marker name in set is corresponding to a marker from customMarkers array
If there is no corresponding marker in an array delete the name from uniqueNames set
*/
function rescan() {
  uniqueNames.forEach(name => {
    if (!customMarkers.some(marker => marker.markerName === name)) {
      uniqueNames.delete(name);
    }
  });
}


const checkpointPopupTemplate = document.querySelector("#checkpoint-popup-template"); //popup template

Cords.bindPopup("");//bind popup to checkpoint marker
Cords.openPopup("");//open checkpoint marker popup

//when user stops draging the checkpoint marker
Cords.on("dragend", () => {
  let coordinates = getCords(Cords); //get coordinates
  let checkpoint = checkpointPopupTemplate.content.cloneNode(true); //use the checkpoint template
  checkpoint.querySelector(".checkpoint-coordinates").textContent = coordinates;//show the coordinates
  checkpoint.querySelector(".addMarker").addEventListener("click", () => {
    addMarker(); //add marker to list and map
  });
  checkpoint.querySelector(".closeCords").addEventListener("click", () => {
    closeCords(Cords); //remove the checkpoint marker from map
  });
  Cords.getPopup().setContent(checkpoint).openOn(Worldmap); //open checkpoint popup
});

let markerID = 0; //ID for markers, always Uniqe

//function to keep ID unique
function newID() {
  markerID++;
}

const customMarkersContainer = document.querySelector(".custom-markers-container"); //sidebar container for user created markers
customMarkersContainer.addEventListener("click", (event) => goToMarker(event, customMarkers)); //when marker from the sidebar is clicked got to it`s location

//This function lets you rename markers
customMarkersContainer.addEventListener("click", function Rename(event) {
  event.preventDefault();

  let rename = event.target.closest(".marker-rename"); //take the clicked marker
  let modal = document.querySelector(".modal-rename");//open modal for reanming markers
  let required = modal.querySelector(".name-required-modal"); //warning modal
  let closeModal = modal.querySelector(".modal-close"); //close modal button

  closeModal.addEventListener("click", () => {
    modal.close(); //close modal
    required.classList.remove("name-required-modal--active");
    document.querySelector(".name-exists-modal").classList.remove("name-exists-modal--active");
    modal.querySelector(".modal-input").value = "";
  });

  if (!rename) {
   return;
  }

  let listItem = rename.closest(".marker-list-item");
  let markerLink = listItem.querySelector(".marker-link");
  let markerID = markerLink.dataset.markerId;
  let markerToRename = customMarkers.find((marker) => String(marker.markerID) === markerID);
  let modalInput = modal.querySelector(".modal-input");
  let oldName = markerToRename.markerName;

  modal.showModal(); //open modal 

  let acceptName = modal.querySelector(".modal-accept"); //accept new name and rename marker

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
  rescan();
});

customMarkersContainer.addEventListener("click", function removeMarker(event) {
  event.preventDefault();
  let markerDelete = event.target.closest(".marker-delete");
  let modal = document.querySelector(".modal-delete");
  let modalTakeAction = modal.querySelector(".modal-take-action");
  let modalDropAction = modal.querySelector(".modal-drop-action");

  if (!markerDelete) {
    return;
  }

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

  modalTakeAction.addEventListener("click", removeItem);
  modalDropAction.addEventListener("click", () => {
    modal.close();
    return;
  });


});

// Capitalize first letter of the name of layer and marker
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
  let choosenIcon = document.querySelector('#icons-menu').value;
  const customIcon = createCustomIcon(choosenIcon);
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
    markerIcon: choosenIcon,
  };
  customMarkers.push(newMarker);

  let customMarker = L.marker(markerCoordinates, { icon: customIcon });
  let customPopupContent = `<div class="custom-popup">${markerName}</div>`;
  customMarker.bindPopup(customPopupContent).openPopup();
  newMarker.mapMarker = customMarker;

  let targetLayer = overlaysArray.find((layer) => layer.name === overlayName);
  targetLayer.group.addLayer(customMarker);

  const customItem = document.querySelector("#sidebar-marker-template--custom");

  addToList(customMarkersContainer, overlayName, markerName, markerCoordinates, markerID, customItem);
}

//function for exporting user created markers
const exportJSONfile = document.querySelector(".export-json").addEventListener("click", function () {
  if (customMarkers.length > 0) {
    let markerData = customMarkers.map((marker) => {
      let { markerName, coordinates, overlayName, markerIcon } = marker;
      return {
        markerName: markerName,
        coordinates: coordinates,
        overlayName: overlayName,
        markerIcon: markerIcon
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
      let { markerName, coordinates, overlayName, markerIcon } = marker;
      return `('${markerName}', '${coordinates[0]}', '${coordinates[1]}', '${overlayName}', '${markerIcon}'),`;
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
