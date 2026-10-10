
/* =========================================
   LINKBASE // MARK II
   STARK SYSTEMS INTERFACE
   ========================================= */

const STORAGE_KEY = "linkbase-links";

// ---------- LOAD SAVED LINKS ----------

const defaultLinks = [
    {
        name: "Google",
        url: "https://www.google.com",
        category: "Tools"
    }
];

let links = [];

try {
    const savedLinks = localStorage.getItem(STORAGE_KEY);
    const parsedLinks = savedLinks ? JSON.parse(savedLinks) : null;

    links = Array.isArray(parsedLinks)
        ? parsedLinks.filter(link =>
            link &&
            typeof link.name === "string" &&
            typeof link.url === "string" &&
            typeof link.category === "string"
        )
        : [...defaultLinks];
} catch (error) {
    console.error("Could not load saved links:", error);
    links = [...defaultLinks];
}

// ---------- ELEMENTS ----------

const linksContainer = document.getElementById("links-container");
const linkForm = document.getElementById("link-form");
const searchInput = document.getElementById("search-input");

const addPanel = document.getElementById("add-panel");
const navHome = document.getElementById("nav-home");
const navSearch = document.getElementById("nav-search");
const navAdd = document.getElementById("nav-add");

const linkCount = document.getElementById("link-count");
const emptyState = document.getElementById("empty-state");

const systemClock = document.getElementById("system-clock");
const systemDate = document.getElementById("system-date");

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const cancelEdit = document.getElementById("cancel-edit");
const closeEdit = document.getElementById("close-edit");

let editingLink = null;
let activeCategory = null;

// ---------- STORAGE ----------

function saveLinks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch (error) {
        console.error("Could not save links:", error);
        alert("Your browser could not save the changes.");
    }
}

// ---------- CLOCK AND DATE ----------

function updateSystemTime() {
    const now = new Date();

    if (systemClock) {
        systemClock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }

    if (systemDate) {
        systemDate.textContent = now
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
            .toUpperCase();
    }
}

updateSystemTime();
setInterval(updateSystemTime, 1000);

// ---------- URL VALIDATION ----------

function getValidUrl(value) {
    try {
        const parsedUrl = new URL(value);

        if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
        ) {
            return null;
        }

        return parsedUrl.href;
    } catch {
        return null;
    }
}

// ---------- RENDER LINKS ----------

function renderLinks() {
    if (!linksContainer) return;

    linksContainer.replaceChildren();

    const query = (searchInput?.value || "")
        .toLowerCase()
        .trim();

    const filteredLinks = links.filter(link => {
        const matchesSearch =
            link.name.toLowerCase().includes(query) ||
            link.category.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query);

        const matchesCategory =
            !activeCategory ||
            link.category.toLowerCase() ===
                activeCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    filteredLinks.forEach(link => {
        const card = document.createElement("div");
        card.className = "link-card";

        const linkElement = document.createElement("a");
        linkElement.className = "link-title";
        linkElement.href = link.url;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.textContent = link.name;

        const urlLabel = document.createElement("p");
        urlLabel.className = "link-url";
        urlLabel.textContent = link.url;

        const category = document.createElement("p");
        category.className = "link-category";
        category.textContent = link.category;

        const actions = document.createElement("div");
        actions.className = "link-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "EDIT";
        editButton.addEventListener("click", () => editLink(link));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "DELETE";
        deleteButton.addEventListener("click", () => deleteLink(link));

        actions.append(editButton, deleteButton);
        card.append(linkElement, urlLabel, category, actions);
        linksContainer.appendChild(card);
    });

    // Update visible resource count.
    if (linkCount) {
        linkCount.textContent = String(filteredLinks.length).padStart(2, "0");
    }

    // Show the empty state when no results match.
    if (emptyState) {
        emptyState.classList.toggle("hidden", filteredLinks.length > 0);
    }
}

// ---------- ADD PANEL ----------

function openAddPanel() {
    if (!addPanel) return;

    addPanel.classList.remove("hidden");

    navAdd?.classList.add("active");

    document.getElementById("link-name")?.focus();

    addPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function closeAddPanel() {
    if (!addPanel) return;

    addPanel.classList.add("hidden");
    navAdd?.classList.remove("active");
}

function toggleAddPanel() {
    if (!addPanel) return;

    if (addPanel.classList.contains("hidden")) {
        openAddPanel();
    } else {
        closeAddPanel();
    }
}

// Hidden until the user requests it.
closeAddPanel();

navAdd?.addEventListener("click", toggleAddPanel);

// ---------- ADD LINK ----------

linkForm?.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("link-name").value.trim();
    const rawUrl = document.getElementById("link-url").value.trim();
    const category = document.getElementById("link-category").value.trim();

    const url = getValidUrl(rawUrl);

    if (!name || !category) {
        alert("Please enter a name and category.");
        return;
    }

    if (!url) {
        alert("Please enter a valid HTTP or HTTPS URL.");
        return;
    }

    links.push({ name, url, category });

    saveLinks();

    // Reset filters so the new link is visible.
    searchInput.value = "";
    activeCategory = null;
    updateCategoryButtons();

    renderLinks();
    linkForm.reset();
    closeAddPanel();
});

// ---------- SEARCH ----------

searchInput?.addEventListener("input", renderLinks);

navSearch?.addEventListener("click", () => {
    searchInput?.focus();

    searchInput?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

// ---------- HOME NAVIGATION ----------

navHome?.addEventListener("click", () => {
    activeCategory = null;

    if (searchInput) {
        searchInput.value = "";
    }

    updateCategoryButtons();
    renderLinks();

    document.getElementById("home")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// ---------- QUICK ACCESS FILTERS ----------

const quickItems = document.querySelectorAll(".quick-item");

function updateCategoryButtons() {
    quickItems.forEach(button => {
        const category = button.dataset.category;

        button.classList.toggle(
            "active",
            Boolean(activeCategory) &&
            category?.toLowerCase() === activeCategory.toLowerCase()
        );
    });
}

quickItems.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        if (!category) return;

        // Press the active category again to clear the filter.
        activeCategory =
            activeCategory?.toLowerCase() === category.toLowerCase()
                ? null
                : category;

        updateCategoryButtons();
        renderLinks();

        document.getElementById("links-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

// ---------- DELETE LINK ----------

function deleteLink(linkToDelete) {
    const confirmed = confirm(
        `Delete "${linkToDelete.name}"?`
    );

    if (!confirmed) return;

    links = links.filter(link => link !== linkToDelete);

    saveLinks();
    renderLinks();
}

// ---------- EDIT LINK ----------

function editLink(linkToEdit) {
    editingLink = linkToEdit;

    document.getElementById("edit-name").value = linkToEdit.name;
    document.getElementById("edit-url").value = linkToEdit.url;
    document.getElementById("edit-category").value = linkToEdit.category;

    editModal?.classList.remove("hidden");
    document.getElementById("edit-name")?.focus();
}

function closeEditModal() {
    editModal?.classList.add("hidden");
    editingLink = null;
    editForm?.reset();
}

editForm?.addEventListener("submit", event => {
    event.preventDefault();

    if (!editingLink) return;

    const name = document.getElementById("edit-name").value.trim();
    const rawUrl = document.getElementById("edit-url").value.trim();
    const category = document.getElementById("edit-category").value.trim();

    const url = getValidUrl(rawUrl);

    if (!name || !category) {
        alert("Please enter a name and category.");
        return;
    }

    if (!url) {
        alert("Please enter a valid HTTP or HTTPS URL.");
        return;
    }

    editingLink.name = name;
    editingLink.url = url;
    editingLink.category = category;

    saveLinks();
    closeEditModal();
    renderLinks();
});

cancelEdit?.addEventListener("click", closeEditModal);
closeEdit?.addEventListener("click", closeEditModal);

// Close the edit dialog when its backdrop is clicked.
editModal?.querySelector("[data-close-modal]")?.addEventListener(
    "click",
    closeEditModal
);

// ---------- KEYBOARD SHORTCUTS ----------

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (editModal && !editModal.classList.contains("hidden")) {
        closeEditModal();
    } else if (addPanel && !addPanel.classList.contains("hidden")) {
        closeAddPanel();
    }
});

// ---------- INITIALIZE ----------

updateCategoryButtons();
renderLinks();