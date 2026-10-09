let links =
JSON.parse(localStorage.getItem("linkbase-links")) ||
[
    {
        name: "Google",
        url: "https://www.google.com",
        category: "Tools"
    }
];

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const cancelEdit = document.getElementById("cancel-edit");

let editingLink = null;
const linksContainer = document.getElementById("links-container");
const linkForm = document.getElementById("link-form");
const searchInput = document.getElementById("search-input");

function renderLinks() {
    linksContainer.innerHTML = "";

    const query = searchInput.value.toLowerCase().trim();

    const filteredLinks = links.filter(function(link) {
        return (
            link.name.toLowerCase().includes(query) ||
            link.category.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query)
        );
    });

    filteredLinks.forEach(function(link) {
    const card = document.createElement("div");
    card.className = "link-card";

    const linkElement = document.createElement("a");
    linkElement.href = link.url;
    linkElement.target = "_blank";
    linkElement.rel = "noopener noreferrer";
    linkElement.textContent = link.name;
    linkElement.className = "link-title";

    const category = document.createElement("p");
    category.textContent = link.category;
    category.className = "link-category";

    const actions = document.createElement("div");
    actions.className = "link-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function() {
        editLink(link);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function() {
        deleteLink(link);
    });

    actions.append(editButton, deleteButton);
    card.append(linkElement, category, actions);
    linksContainer.appendChild(card);
});
}

linkForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("link-name").value.trim();
    const url = document.getElementById("link-url").value.trim();
    const category = document.getElementById("link-category").value.trim();

    links.push({
        name: name,
        url: url,
        category: category
    });
    localStorage.setItem("linkbase-links" , JSON.stringify(links));

    renderLinks();
    linkForm.reset();
});

searchInput.addEventListener("input", renderLinks);

renderLinks();

function deleteLink(linkToDelete) {
    const confirmed = confirm(
        `Delete "${linkToDelete.name}"?`
    );

    if (!confirmed) return;

    links = links.filter(function(link) {
        return link !== linkToDelete;
    });

    localStorage.setItem("linkbase-links", JSON.stringify(links));
    renderLinks();
}

function editLink(linkToEdit) {
    editingLink = linkToEdit;

    document.getElementById("edit-name").value = linkToEdit.name;
    document.getElementById("edit-url").value = linkToEdit.url;
    document.getElementById("edit-category").value = linkToEdit.category;

    editModal.classList.remove("hidden");
}

editForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("edit-name").value.trim();
    const url = document.getElementById("edit-url").value.trim();
    const category = document.getElementById("edit-category").value.trim();

    try {
        const parsedUrl = new URL(url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            alert("Please use an HTTP or HTTPS link.");
            return;
        }
    } catch {
        alert("Please enter a valid URL.");
        return;
    }

    if (!name || !category || !editingLink) return;

    editingLink.name = name;
    editingLink.url = url;
    editingLink.category = category;

    localStorage.setItem("linkbase-links", JSON.stringify(links));

    editModal.classList.add("hidden");
    editingLink = null;
    renderLinks();
});

cancelEdit.addEventListener("click", function() {
    editModal.classList.add("hidden");
    editingLink = null;
});