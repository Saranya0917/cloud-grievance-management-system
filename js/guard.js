/* ================================
   DASHBOARD AUTHENTICATION GUARD
================================ */

function getTokenPayload() {

    const idToken = localStorage.getItem("idToken");

    if (!idToken) {
        return null;
    }

    try {

        const parts = idToken.split(".");

        if (parts.length !== 3) {
            return null;
        }

        return JSON.parse(
            atob(
                parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    } catch (error) {

        console.error(
            "Unable to read authentication token:",
            error
        );

        return null;
    }
}


function checkDashboardAccess(requiredRole) {

    const payload = getTokenPayload();

    if (!payload) {

        window.location.href =
            "login.html?role=" + requiredRole;

        return false;
    }


    /* Check token expiration */

    const currentTime =
        Math.floor(Date.now() / 1000);

    if (
        payload.exp &&
        payload.exp < currentTime
    ) {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("idToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");

        window.location.href =
            "login.html?role=" + requiredRole;

        return false;
    }


    const groups =
        payload["cognito:groups"] || [];


    /* Determine actual role */

    let actualRole = "student";

    if (groups.includes("Admin")) {

        actualRole = "admin";

    } else if (groups.includes("Staff")) {

        actualRole = "staff";
    }


    /* Check required role */

    if (actualRole !== requiredRole) {

        if (actualRole === "admin") {

            window.location.href =
                "admin-dashboard.html";

        } else if (actualRole === "staff") {

            window.location.href =
                "staff-dashboard.html";

        } else {

            window.location.href =
                "dashboard.html";
        }

        return false;
    }


    return true;
}