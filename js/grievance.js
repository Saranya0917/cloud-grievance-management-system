const API_BASE_URL =
    "https://jtwhnrg126.execute-api.ap-south-1.amazonaws.com";

const grievanceForm = document.getElementById("grievanceForm");

if (grievanceForm) {
    grievanceForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const categoryId = document.getElementById("categoryId").value;
        const subject = document.getElementById("subject").value;
        const description = document.getElementById("description").value;
        const priority = document.getElementById("priority").value;

        const userEmail = localStorage.getItem("userEmail");

        const message = document.getElementById("message");

        if (!userEmail) {
            message.textContent = "Please login first.";
            return;
        }

        const grievanceData = {
            user_id: userEmail,
            category_id: categoryId,
            subject: subject,
            description: description,
            priority: priority
        };

        try {
            const response = await fetch(
                API_BASE_URL + "/grievances/submit",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(grievanceData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to submit grievance."
                );
            }

            message.textContent =
                "Grievance submitted successfully! Grievance ID: " +
                data.grievanceId;

            grievanceForm.reset();

        } catch (error) {
            console.error(error);
            message.textContent =
                error.message || "Unable to submit grievance.";
        }
    });
}
const loadGrievancesButton = document.getElementById("loadGrievances");

if (loadGrievancesButton) {
    loadGrievancesButton.addEventListener("click", async function () {

        const grievancesList = document.getElementById("grievancesList");
        const userEmail = localStorage.getItem("userEmail");

        if (!userEmail) {
            grievancesList.textContent = "Please login first.";
            return;
        }

        grievancesList.textContent = "Loading grievances...";

        try {
            const response = await fetch(
                API_BASE_URL + "/grievances/my",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userEmail
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load grievances."
                );
            }

            if (data.grievances.length === 0) {
                grievancesList.textContent =
                    "You have not submitted any grievances yet.";
                return;
            }

            grievancesList.innerHTML = "";

            data.grievances.forEach(function (grievance) {

                const grievanceCard = document.createElement("div");

                grievanceCard.style.border = "1px solid #ddd";
                grievanceCard.style.padding = "15px";
                grievanceCard.style.marginTop = "15px";
                grievanceCard.style.borderRadius = "8px";

                grievanceCard.innerHTML = `
                    <h3>${grievance.subject}</h3>
                    <p><strong>Grievance ID:</strong> ${grievance.grievanceId}</p>
                    <p><strong>Category:</strong> ${grievance.categoryId}</p>
                    <p><strong>Priority:</strong> ${grievance.priority}</p>
                    <p><strong>Status:</strong> ${grievance.status}</p>
                    <p><strong>Description:</strong> ${grievance.description}</p>
                    <p><strong>Submitted:</strong> ${grievance.createdAt}</p>
                `;

                grievancesList.appendChild(grievanceCard);
            });

        } catch (error) {
            console.error(error);

            grievancesList.textContent =
                error.message || "Unable to load grievances.";
        }
    });
}
// ==========================================
// STAFF DASHBOARD
// ==========================================

// View Assigned Grievances

const loadAssignedButton =
    document.getElementById("loadAssignedGrievances");

if (loadAssignedButton) {

    loadAssignedButton.addEventListener("click", async function () {

        const list =
            document.getElementById("assignedGrievancesList");

        const staffId = localStorage.getItem("userEmail");

        if (!staffId) {
            list.textContent = "Please login first.";
            return;
        }

        list.textContent = "Loading assigned grievances...";

        try {

            const response = await fetch(
                API_BASE_URL +
                "/grievances/assigned?staff_id=" +
                encodeURIComponent(staffId),
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load assigned grievances."
                );
            }
            // Update staff dashboard summary cards
const assignedGrievances = data.grievances || [];

const totalElement = document.getElementById("totalAssignedCount");
const progressElement = document.getElementById("inProgressCount");
const resolvedElement = document.getElementById("resolvedCount");

if (totalElement) {
    totalElement.textContent = assignedGrievances.length;
}

if (progressElement) {
    progressElement.textContent = assignedGrievances.filter(
        grievance =>
            String(grievance.status || "").toUpperCase() === "IN_PROGRESS"
    ).length;
}

if (resolvedElement) {
    resolvedElement.textContent = assignedGrievances.filter(
        grievance =>
            String(grievance.status || "").toUpperCase() === "RESOLVED"
    ).length;
}

            if (data.grievances.length === 0) {

                list.textContent =
                    "No grievances are assigned to you.";

                return;
            }

            list.innerHTML = "";

            data.grievances.forEach(function (grievance) {

                const card =
                    document.createElement("div");

                card.style.border = "1px solid #ddd";
                card.style.padding = "15px";
                card.style.marginTop = "15px";
                card.style.borderRadius = "8px";

                card.innerHTML = `
                    <h3>${grievance.subject}</h3>

                    <p>
                        <strong>Grievance ID:</strong>
                        ${grievance.grievanceId}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${grievance.categoryId}
                    </p>

                    <p>
                        <strong>Priority:</strong>
                        ${grievance.priority}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${grievance.status}
                    </p>

                    <p>
                        <strong>Description:</strong>
                        ${grievance.description}
                    </p>

                    <p>
                        <strong>Assigned To:</strong>
                        ${grievance.assignedTo}
                    </p>
                `;

                list.appendChild(card);
            });

        } catch (error) {

            console.error(error);

            list.textContent =
                error.message ||
                "Unable to load assigned grievances.";
        }
    });
}


// ==========================================
// UPDATE GRIEVANCE STATUS
// ==========================================

const statusForm =
    document.getElementById("statusForm");

if (statusForm) {

    statusForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const grievanceId =
            document.getElementById("statusGrievanceId").value;

        const newStatus =
            document.getElementById("newStatus").value;

        const message =
            document.getElementById("statusMessage");

        try {

            const response = await fetch(
                API_BASE_URL + "/grievances/status",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        grievanceId: grievanceId,
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update grievance status."
                );
            }

            message.textContent =
                "Grievance status updated successfully!";

            statusForm.reset();

        } catch (error) {

            console.error(error);

            message.textContent =
                error.message ||
                "Unable to update grievance status.";
        }
    });
}


// ==========================================
// ADD GRIEVANCE UPDATE
// ==========================================

const updateForm =
    document.getElementById("updateForm");

if (updateForm) {

    updateForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const grievanceId =
            document.getElementById("updateGrievanceId").value;

        const updateText =
            document.getElementById("updateText").value;

        const staffId =
            localStorage.getItem("userEmail");

        const message =
            document.getElementById("updateMessage");

        if (!staffId) {

            message.textContent =
                "Please login first.";

            return;
        }

        try {

            const response = await fetch(
                API_BASE_URL + "/grievances/update",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        grievanceId: grievanceId,
                        staff_id: staffId,
                        updateText: updateText
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to add grievance update."
                );
            }

            message.textContent =
                "Grievance update added successfully!";

            updateForm.reset();

        } catch (error) {

            console.error(error);

            message.textContent =
                error.message ||
                "Unable to add grievance update.";
        }
    });
}


// ==========================================
// STAFF UPDATE HISTORY
// ==========================================
document.getElementById("loadStaffHistory")?.addEventListener("click", async function () {

    const historyList = document.getElementById("staffHistoryList");
    const staffId = localStorage.getItem("userEmail");

    historyList.innerHTML = "Loading...";

    try {

        const response = await fetch(
            API_BASE_URL +
            "/staff/history?staff_id=" +
            encodeURIComponent(staffId),
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log("Staff history response:", data);

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load history."
            );
        }

        const updates = data.updates || [];

        if (updates.length === 0) {
            historyList.innerHTML =
                "<p>No update history found.</p>";
            return;
        }

        historyList.innerHTML = "";

        updates.forEach(function (update) {

            const item = document.createElement("div");

            item.innerHTML = `
                <hr>
                <p><strong>Grievance ID:</strong>
                    ${update.grievanceId || update.grievance_id || "N/A"}
                </p>

                <p><strong>Update:</strong>
                    ${update.updateText || update.update_text || update.text || "N/A"}
                </p>

                <p><strong>Staff:</strong>
                    ${update.staffId || "N/A"}
                </p>
            `;

            historyList.appendChild(item);
        });

    } catch (error) {

        console.error("History error:", error);

        historyList.innerHTML =
            "<p>" + error.message + "</p>";
    }
});
// ==========================================
// ADMIN DASHBOARD
// ==========================================

// ==========================================
// ADMIN DASHBOARD - VIEW AND FILTER GRIEVANCES
// ==========================================

const loadAllButton =
    document.getElementById("loadAllGrievances");

const allGrievancesList =
    document.getElementById("allGrievancesList");

const filterStatus =
    document.getElementById("filterStatus");

const filterAssignment =
    document.getElementById("filterAssignment");

const searchGrievanceId =
    document.getElementById("searchGrievanceId");

const clearGrievanceFilters =
    document.getElementById("clearGrievanceFilters");

const grievanceFilterCount =
    document.getElementById("grievanceFilterCount");

let adminGrievancesCache = [];
let grievancesLoaded = false;


// Normalize status values such as IN_PROGRESS and In Progress.
function normalizeGrievanceStatus(status) {
    return String(status || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}


// Safely display text returned by the API.
function createAdminGrievanceCard(grievance) {

    const card = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = grievance.subject || "Untitled Grievance";
    card.appendChild(heading);

    function addField(label, value) {

        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = label + ": ";

        paragraph.appendChild(strong);
        paragraph.appendChild(
            document.createTextNode(String(value ?? "N/A"))
        );

        card.appendChild(paragraph);
    }

    addField("Grievance ID", grievance.grievanceId);
    addField("Student", grievance.userId);
    addField("Category", grievance.categoryId);
    addField("Priority", grievance.priority);
    addField("Status", grievance.status);
    addField("Description", grievance.description);

    const assignedTo =
        grievance.assignedTo ??
        grievance.assigned_to ??
        "";

    addField(
        "Assigned To",
        String(assignedTo).trim() || "Not assigned"
    );

    return card;
}


// Apply the selected filters to the cached grievance records.
function renderFilteredGrievances() {

    if (!allGrievancesList) {
        return;
    }

    const selectedStatus =
        filterStatus ? filterStatus.value : "ALL";

    const selectedAssignment =
        filterAssignment ? filterAssignment.value : "ALL";

    const searchId = searchGrievanceId
        ? searchGrievanceId.value.trim().toLowerCase()
        : "";

    const filteredGrievances = adminGrievancesCache.filter(
        function (grievance) {

            // Filter by status.
            const grievanceStatus =
                normalizeGrievanceStatus(grievance.status);

            const matchesStatus =
                selectedStatus === "ALL" ||
                grievanceStatus === selectedStatus;

            // Filter by assignment.
            const assignedTo =
                grievance.assignedTo ??
                grievance.assigned_to ??
                "";

            const assignmentValue = String(assignedTo).trim();

            const isAssigned =
                assignmentValue !== "" &&
                assignmentValue.toLowerCase() !== "not assigned" &&
                assignmentValue.toLowerCase() !== "none" &&
                assignmentValue.toLowerCase() !== "null";

            const matchesAssignment =
                selectedAssignment === "ALL" ||
                (
                    selectedAssignment === "ASSIGNED" &&
                    isAssigned
                ) ||
                (
                    selectedAssignment === "NOT_ASSIGNED" &&
                    !isAssigned
                );

            // Search by grievance ID.
            const grievanceId =
                String(grievance.grievanceId || "").toLowerCase();

            const matchesSearch =
                grievanceId.includes(searchId);

            return (
                matchesStatus &&
                matchesAssignment &&
                matchesSearch
            );
        }
    );

    allGrievancesList.innerHTML = "";

    if (grievanceFilterCount) {
        grievanceFilterCount.textContent =
            "Showing " +
            filteredGrievances.length +
            " of " +
            adminGrievancesCache.length +
            " grievances";
    }

    if (filteredGrievances.length === 0) {

        allGrievancesList.textContent =
            adminGrievancesCache.length === 0
                ? "No grievances found."
                : "No grievances match the selected filters.";

        return;
    }

    filteredGrievances.forEach(function (grievance) {

        const card = createAdminGrievanceCard(grievance);

        allGrievancesList.appendChild(card);

    });
}


// Load all grievance records from the existing API.
if (loadAllButton) {

    loadAllButton.addEventListener("click", async function () {

        allGrievancesList.textContent =
            "Loading all grievances...";

        if (grievanceFilterCount) {
            grievanceFilterCount.textContent = "";
        }

        loadAllButton.disabled = true;

        try {

            const response = await fetch(
                API_BASE_URL + "/grievances/all",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load grievances."
                );
            }

            adminGrievancesCache =
                Array.isArray(data.grievances)
                    ? data.grievances
                    : [];

            grievancesLoaded = true;

            renderFilteredGrievances();

        } catch (error) {

            console.error("Load grievances error:", error);

            adminGrievancesCache = [];
            grievancesLoaded = false;

            allGrievancesList.textContent =
                error.message ||
                "Unable to load grievances.";

            if (grievanceFilterCount) {
                grievanceFilterCount.textContent = "";
            }

        } finally {

            loadAllButton.disabled = false;

        }
    });
}


// Reapply filters when the user changes a selection or search.
if (filterStatus) {
    filterStatus.addEventListener("change", function () {

        if (grievancesLoaded) {
            renderFilteredGrievances();
        }
    });
}

if (filterAssignment) {
    filterAssignment.addEventListener("change", function () {

        if (grievancesLoaded) {
            renderFilteredGrievances();
        }
    });
}

if (searchGrievanceId) {
    searchGrievanceId.addEventListener("input", function () {

        if (grievancesLoaded) {
            renderFilteredGrievances();
        }
    });
}


// Clear the filters without changing the stored grievance records.
if (clearGrievanceFilters) {

    clearGrievanceFilters.addEventListener("click", function () {

        if (filterStatus) {
            filterStatus.value = "ALL";
        }

        if (filterAssignment) {
            filterAssignment.value = "ALL";
        }

        if (searchGrievanceId) {
            searchGrievanceId.value = "";
        }

        if (grievancesLoaded) {
            renderFilteredGrievances();
        }
    });
}


// ==========================================
// ASSIGN GRIEVANCE
// ==========================================

const assignForm =
    document.getElementById("assignForm");

if (assignForm) {

    assignForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const grievanceId =
            document.getElementById("assignGrievanceId").value;

        const staffId = document.getElementById("staffEmail").value;

        const message =
            document.getElementById("assignMessage");

        try {

            const response = await fetch(
                API_BASE_URL + "/grievances/assign",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        grievanceId: grievanceId,
                        staff_id: staffId
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to assign grievance."
                );
            }

            message.textContent =
                "Grievance assigned successfully!";

            assignForm.reset();

        } catch (error) {

            console.error(error);

            message.textContent =
                error.message ||
                "Unable to assign grievance.";
        }
    });
}
// ADMIN - VIEW GRIEVANCE DETAILS

const grievanceDetailsForm = document.getElementById("grievanceForm");

if (grievanceDetailsForm && document.getElementById("grievanceDetails")) {

    grievanceDetailsForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const grievanceId =
            document.getElementById("grievanceId").value.trim();

        const details =
            document.getElementById("grievanceDetails");

        if (!grievanceId) {
            details.textContent = "Please enter a grievance ID.";
            return;
        }

        details.textContent = "Loading grievance details...";

        try {

            const response = await fetch(
                API_BASE_URL + "/grievances/all",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load grievances."
                );
            }

            const grievance = (data.grievances || []).find(function (item) {

                return String(item.grievanceId) === String(grievanceId);

            });

            if (!grievance) {

                details.innerHTML =
                    "<p>Grievance not found.</p>";

                return;
            }

            details.innerHTML = `
                <h3>${grievance.subject || "N/A"}</h3>

                <p>
                    <strong>Grievance ID:</strong>
                    ${grievance.grievanceId || "N/A"}
                </p>

                <p>
                    <strong>Student:</strong>
                    ${grievance.userId || "N/A"}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${grievance.categoryId || "N/A"}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${grievance.priority || "N/A"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${grievance.status || "N/A"}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${grievance.description || "N/A"}
                </p>

                <p>
                    <strong>Assigned To:</strong>
                    ${grievance.assignedTo || "Not assigned"}
                </p>

                <p>
                    <strong>Submitted:</strong>
                    ${grievance.createdAt || "N/A"}
                </p>
            `;

        } catch (error) {

            console.error("Grievance details error:", error);

            details.textContent =
                error.message ||
                "Unable to load grievance details.";
        }
    });
}