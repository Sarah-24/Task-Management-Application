// Selecting elements
const getCardDetails = document.querySelectorAll(".form-details");
const addTaskElem = document.getElementById("addTaskBtn");
const cardContainer = document.getElementById("cardContainer");

// Load and display existing card details from local storage
document.addEventListener("DOMContentLoaded", () => {
    const storedCardDetails = getStoredCardDetails();
    if (storedCardDetails.length > 0) {
        storedCardDetails.forEach((cardDetails) => {
            createCard(cardDetails);
        });
    }
});

// Event listener for adding a new task
addTaskElem.addEventListener("click", function () {
    const cardDetailsObject = {};
    getCardDetails.forEach((cardDetail) => {
        const cardDetailID = cardDetail.id;
        const cardDetailContent = document.getElementById(cardDetailID).value;
        cardDetailsObject[cardDetailID] = cardDetailContent;
    });

    // Add new card details to local storage
    updateLocalStorage(cardDetailsObject);

    // Display the new card on the page
    createCard(cardDetailsObject);

    // Reset the form after adding a task
    setTimeout(() => {
        document.getElementById("addTaskForm").reset();
    }, 2000);
});

// Function to get existing card details from local storage
function getStoredCardDetails() {
    const keyToCheck = "cardDetailsData";
    const storedItem = localStorage.getItem(keyToCheck);

    return storedItem ? JSON.parse(storedItem) : [];
}

// Function to update local storage with new card details
function updateLocalStorage(cardDetailsObject) {
    const keyToCheck = "cardDetailsData";
    const storedItem = getStoredCardDetails();
    cardDetailsObject.id = cardDetailsObject.imageUrl; // Use imageUrl as a unique identifier
    // Check if the card already exists in local storage based on id
    const existingCardIndex = storedItem.findIndex(item => item.id === cardDetailsObject.id);

    if (existingCardIndex !== -1) {
        // Update the existing card
        storedItem[existingCardIndex] = cardDetailsObject;
    } else {
        // Add the new card
        storedItem.push(cardDetailsObject);
    }

    localStorage.setItem(keyToCheck, JSON.stringify(storedItem));
}

// Function to create and display a card on the page
function createCard(cardDetails) {
    // Check if the card details contain any content
    if (!cardDetails.taskTitle || !cardDetails.taskDesc || !cardDetails.taskType || !cardDetails.imageUrl) {
        return; // Do not create the card if any required field is empty
    }

    const card = document.createElement("div");
    card.className = "card shadow d-flex flex-column gap-2";
    card.style.backgroundColor = "white";
    card.style.width = "19.5rem";
    card.style.height = "500px"; // Set a fixed height for all cards

    // Inside createCard function, after creating cardHeader
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header d-flex justify-content-end gap-2 bg-dark";

    // Pencil button on the left
    const pencilButton = document.createElement("button");
    pencilButton.className = "btn btn-outline-warning";
    pencilButton.innerHTML = '<i class="fa-solid fa-pencil"></i>';
    pencilButton.addEventListener("click", function () {
        // Toggle the card editing mode
        toggleCardEditing(card);
    });
    cardHeader.appendChild(pencilButton);

    // Trash can button on the right
    const deleteButtonId = `trashBtn_${cardDetails.id}`;
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-outline-danger";
    delBtn.id = deleteButtonId;
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    // Adding a click event listener to the delete button
    delBtn.addEventListener("click", function () {
        // You can perform actions when the delete button is clicked
        // For example, remove the card from the page and update local storage
        cardContainer.removeChild(card);
        removeCardFromLocalStorage(cardDetails);
    });

    cardHeader.appendChild(delBtn);
  
    const saveChangesBtn = document.createElement("button");
    saveChangesBtn.className = "btn btn-success save-changes-btn";
    saveChangesBtn.textContent = "Save Changes";
    saveChangesBtn.style.display = "none"; // Initially hidden


    saveChangesBtn.addEventListener("click", function () {
        // Handle saving changes to local storage and updating the card on the page
        saveChangesToCard(card);
    });

    cardHeader.appendChild(saveChangesBtn);

    card.appendChild(cardHeader);


    const cardImgContainer = document.createElement("div");
    cardImgContainer.className = "card-img";
    cardImgContainer.style.overflow = "hidden"; // Ensure overflow is hidden
    cardImgContainer.style.height = "50%"; // Set a height for the image container

    const cardImg = document.createElement("img");
    cardImg.src = cardDetails.imageUrl;
    cardImg.className = "card-img-top";
    cardImg.alt = cardDetails.taskType;
    cardImg.style.objectFit = "cover";
    cardImg.style.width = "100%";
    cardImg.style.height = "100%";

    cardImgContainer.appendChild(cardImg);
    card.appendChild(cardImgContainer);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column gap-2";
    cardBody.innerHTML = `
    <h5 class="card-title" id="cardTitle">${cardDetails.taskTitle}</h5>
    <p class="card-text" id="cardDesc">${cardDetails.taskDesc}</p>
    <div class="card-link">
    <span class="badge text-bg-dark text-white" id="cardType">${cardDetails.taskType}</span>
    </div>
    `;
    card.dataset.cardId = cardDetails.id;

    const openTaskBtn = document.createElement("a");
    openTaskBtn.href = "#";
    openTaskBtn.className = "btn btn-warning";
    openTaskBtn.setAttribute("data-bs-toggle", "modal");
    openTaskBtn.setAttribute("data-bs-target", "#exampleModal");

    openTaskBtn.addEventListener("click", function () {
        openTaskModal(card);
    });

    openTaskBtn.textContent = "Open Task";
    cardBody.appendChild(openTaskBtn);
    card.appendChild(cardBody);

    cardContainer.appendChild(card);
}

// Add this style to ensure cards display horizontally
cardContainer.style.display = "flex";
cardContainer.style.flexWrap = "wrap";
cardContainer.style.gap = "50px";
cardContainer.style.justifyContent = "center";

function toggleCardEditing(card) {
    const cardTitle = card.querySelector("#cardTitle");
    const cardDesc = card.querySelector("#cardDesc");
    const cardType = card.querySelector("#cardType");
    const saveChangesBtn = card.querySelector(".save-changes-btn");

    const isEditing = cardTitle.isContentEditable;

    cardTitle.contentEditable = !isEditing;
    cardDesc.contentEditable = !isEditing;
    cardType.contentEditable = !isEditing;

    // Toggle the visibility of the Save Changes button
    saveChangesBtn.style.display = isEditing ? "none" : "block";

    if (!isEditing) {
        // If entering edit mode, focus on the title for better user experience
        cardTitle.focus();
    }
}

function saveChangesToCard(card) {
    const cardId = card.dataset.cardId;
    const cardDetails = {
        id: cardId,
        taskTitle: card.querySelector("#cardTitle").innerHTML,
        taskDesc: card.querySelector("#cardDesc").innerHTML,
        taskType: card.querySelector("#cardType").innerHTML,
        imageUrl: card.querySelector(".card-img-top").src,
    };

    // Update the card details in local storage
    updateLocalStorage(cardDetails);

    // Close the edit mode
    toggleCardEditing(card);
}

// Function to remove a card from local storage
function removeCardFromLocalStorage(cardDetails) {
    const keyToCheck = "cardDetailsData";
    const storedItem = getStoredCardDetails();

    // Find the index of the card in the stored items
    const index = storedItem.findIndex(item => (
        item.imageUrl === cardDetails.imageUrl &&
        item.taskTitle === cardDetails.taskTitle &&
        item.taskType === cardDetails.taskType &&
        item.taskDesc === cardDetails.taskDesc
    ));

    // Remove the card from the array
    if (index !== -1) {
        storedItem.splice(index, 1);
        localStorage.setItem(keyToCheck, JSON.stringify(storedItem));
    }
}

// Function to display task details in the modal
function displayTaskDetails(cardDetails) {
    const modalTitle = document.getElementById("exampleModalLabel");
    const modalBody = document.querySelector(".modal-body");

    // Set modal title
    modalTitle.textContent = cardDetails.taskTitle;

    // Retrieve content from the card
    const cardDescElement = document.querySelector("#editableDesc");
    const cardTypeElement = document.querySelector("#editableType");

    if (cardDescElement && cardTypeElement) {
        // Update modal body content
        modalBody.innerHTML = `
            <p>${cardDescElement.textContent}</p>
            <p>Task Type: ${cardTypeElement.textContent}</p>
            <img src="${cardDetails.imageUrl}" alt="${cardDetails.taskType}" style="max-width: 100%;">
        `;
    }

    // Show the modal
    $('#exampleModal').modal('show');
}

// Function to open the modal and populate it with card details
function openTaskModal(card) {
    const modalTitle = document.getElementById("exampleModalLabel");
    const modalBody = document.querySelector("#exampleModal .modal-body");

    // Extract updated content from the card
    const cardTitle = card.querySelector("#cardTitle").textContent;
    const cardDesc = card.querySelector("#cardDesc").textContent;
    const cardType = card.querySelector("#cardType").textContent;
    const cardImgSrc = card.querySelector(".card-img-top").src;

    modalTitle.textContent = cardTitle;

    // Create elements similar to the card for displaying details
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "card shadow";

    const cardImgContainer = document.createElement("div");
    cardImgContainer.className = "card-img";
    cardImgContainer.style.overflow = "hidden"; // Ensure overflow is hidden
    cardImgContainer.style.height = "600px"; // Set a height for the image container

    const cardImg = document.createElement("img");
    cardImg.src = cardImgSrc;
    cardImg.className = "card-img-top";
    cardImg.alt = cardType;
    cardImg.style.objectFit = "cover";
    cardImg.style.width = "100%";
    cardImg.style.height = "100%";

    cardImgContainer.appendChild(cardImg);
    detailsContainer.appendChild(cardImgContainer);

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column gap-2";
    cardBody.innerHTML = `
        <p class="card-text">${cardDesc}</p>
        <div class="card-link">
            <span class="badge text-bg-dark text-white">${cardType}</span>
        </div>
    `;

    detailsContainer.appendChild(cardBody);
    modalBody.innerHTML = ''; // Clear existing content
    modalBody.appendChild(detailsContainer);

    // Show the modal
    $('#exampleModal').modal('show');
}

// Select the search input element and the search icon
const searchInput = document.getElementById("searchInput");
const searchIcon = document.getElementById("searchIcon");

// Event listener for search icon click
searchIcon.addEventListener("click", function () {
    console.log("Search icon clicked");
    const searchTerm = searchInput.value.trim().toLowerCase();
    console.log("Search Term:", searchTerm);

    // Filter and display cards based on the search term
    filterAndDisplayCards(searchTerm);
});

// Function to filter and display cards based on the search term
function filterAndDisplayCards(searchTerm) {
    console.log("Filtering cards with term:", searchTerm);

    const cards = document.querySelectorAll(".card");
    console.log("Total cards:", cards.length);

    cards.forEach((card) => {
        const cardTitle = card.querySelector("#cardTitle").textContent.toLowerCase();
        const cardDesc = card.querySelector("#cardDesc").textContent.toLowerCase();
        const cardType = card.querySelector("#cardType").textContent.toLowerCase();

        console.log("Card Title:", cardTitle);
        console.log("Card Description:", cardDesc);
        console.log("Card Type:", cardType);

        // Check if any part of the card matches the search term
        const isMatch =
            cardTitle.includes(searchTerm) ||
            cardDesc.includes(searchTerm) ||
            cardType.includes(searchTerm);

        console.log("Is Match:", isMatch);

        // Toggle Bootstrap class to hide or show the card
        if (isMatch) {
            card.classList.remove("d-none"); // Show the card
        } else {
            card.classList.add("d-none"); // Hide the card
        }
    });
}
