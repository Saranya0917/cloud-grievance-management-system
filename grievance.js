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

// View All Grievances

const loadAllButton =
    document.getElementById("loadAllGrievances");

if (loadAllButton) {

    loadAllButton.addEventListener("click", async function () {

        const list =
            document.getElementById("allGrievancesList");

        list.textContent =
            "Loading all grievances...";

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

            if (data.grievances.length === 0) {

                list.textContent =
                    "No grievances found.";

                return;
            }

            list.innerHTML = "";

            data.grievances.forEach(function (grievance) {

                const card =
                    document.createElement("div");

                card.style.border =
                    "1px solid #ddd";

                card.style.padding =
                    "15px";

                card.style.marginTop =
                    "15px";

                card.style.borderRadius =
                    "8px";

                card.innerHTML = `
                    <h3>${grievance.subject}</h3>

                    <p>
                        <strong>Grievance ID:</strong>
                        ${grievance.grievanceId}
                    </p>

                    <p>
                        <strong>Student:</strong>
                        ${grievance.userId}
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
                        ${grievance.assignedTo || "Not assigned"}
                    </p>
                `;

                list.appendChild(card);
            });

        } catch (error) {

            console.error(error);

            list.textContent =
                error.message ||
                "Unable to load grievances.";
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