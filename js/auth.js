
const AWS_REGION = "ap-south-1";
const COGNITO_CLIENT_ID = "5monif7dj271u9p68khhuusuk7";

const cognitoEndpoint =
    `https://cognito-idp.${AWS_REGION}.amazonaws.com/`;


/* =====================================================
   USER REGISTRATION
===================================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const phoneInput =
            document.getElementById("phone");

        const phone =
            phoneInput ? phoneInput.value.trim() : "";

        const message =
            document.getElementById("message");


        try {

            const attributes = [
                {
                    Name: "email",
                    Value: email
                },
                {
                    Name: "name",
                    Value: fullName
                }
            ];


            if (phone) {

                attributes.push({
                    Name: "phone_number",
                    Value: phone
                });

            }


            const response = await fetch(cognitoEndpoint, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/x-amz-json-1.1",

                    "X-Amz-Target":
                        "AWSCognitoIdentityProviderService.SignUp"

                },

                body: JSON.stringify({

                    ClientId: COGNITO_CLIENT_ID,

                    Username: email,

                    Password: password,

                    UserAttributes: attributes

                })

            });


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Registration failed."
                );

            }


            message.textContent =
                "Registration successful! Check your email for the verification code.";


            registerForm.reset();


            localStorage.setItem(
                "pendingVerificationEmail",
                email
            );


            setTimeout(function () {

                window.location.href = "confirm.html";

            }, 1500);


        } catch (error) {

            console.error(error);

            message.textContent =
                error.message || "Unable to register.";

        }

    });

}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    /* ---------------------------------------------
       GET ROLE FROM URL
    --------------------------------------------- */

    const params =
        new URLSearchParams(window.location.search);

    const selectedRole =
        params.get("role") || "student";


    const loginTitle =
        document.getElementById("loginTitle");

    const registerLink =
        document.getElementById("registerLink");

    const forgotPasswordLink =
        document.getElementById("forgotPasswordLink");


    /* ---------------------------------------------
       SET PAGE BASED ON ROLE
    --------------------------------------------- */

    if (selectedRole === "student") {

        loginTitle.textContent = "Student Login";

        registerLink.style.display = "block";

        forgotPasswordLink.style.display = "block";

    } else if (selectedRole === "staff") {

        loginTitle.textContent = "Staff Login";

        registerLink.style.display = "none";

        forgotPasswordLink.style.display = "none";

    } else if (selectedRole === "admin") {

        loginTitle.textContent = "Admin Login";

        registerLink.style.display = "none";

        forgotPasswordLink.style.display = "none";

    } else {

        window.location.href = "index.html";

    }

    /* ---------------------------------------------
       LOGIN SUBMIT
    --------------------------------------------- */

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            const message =
                document.getElementById("message");


            message.textContent =
                "Logging in...";


            try {

                /* ---------------------------------
                   COGNITO LOGIN
                --------------------------------- */

                const response =
                    await fetch(
                        cognitoEndpoint,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/x-amz-json-1.1",

                                "X-Amz-Target":
                                    "AWSCognitoIdentityProviderService.InitiateAuth"

                            },

                            body: JSON.stringify({

                                AuthFlow:
                                    "USER_PASSWORD_AUTH",

                                ClientId:
                                    COGNITO_CLIENT_ID,

                                AuthParameters: {

                                    USERNAME:
                                        email,

                                    PASSWORD:
                                        password

                                }

                            })

                        }
                    );


                const data =
                    await response.json();


                /* ---------------------------------
                   LOGIN ERROR
                --------------------------------- */

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Login failed."
                    );

                }


                /* ---------------------------------
                   AUTHENTICATION SUCCESS
                --------------------------------- */

                if (!data.AuthenticationResult) {

                    throw new Error(
                        "Additional authentication is required."
                    );

                }


                const accessToken =
                    data.AuthenticationResult.AccessToken;


                const idToken =
                    data.AuthenticationResult.IdToken;


                const refreshToken =
                    data.AuthenticationResult.RefreshToken || "";


                /* ---------------------------------
                   STORE TOKENS
                --------------------------------- */

                localStorage.setItem(
                    "accessToken",
                    accessToken
                );


                localStorage.setItem(
                    "idToken",
                    idToken
                );


                localStorage.setItem(
                    "refreshToken",
                    refreshToken
                );


                localStorage.setItem(
                    "userEmail",
                    email
                );


                /* ---------------------------------
                   READ ID TOKEN
                --------------------------------- */

                const tokenParts =
                    idToken.split(".");


                const payload =
                    JSON.parse(

                        atob(

                            tokenParts[1]
                                .replace(/-/g, "+")
                                .replace(/_/g, "/")

                        )

                    );


                /* ---------------------------------
                   GET COGNITO GROUPS
                --------------------------------- */

                const groups =
                    payload["cognito:groups"] || [];


                console.log(
                    "Cognito Groups:",
                    groups
                );


                const isAdmin =
                    groups.includes("Admin");


                const isStaff =
                    groups.includes("Staff");


                /* ---------------------------------
                   ROLE VALIDATION
                --------------------------------- */

                if (
                    selectedRole === "admin" &&
                    !isAdmin
                ) {

                    throw new Error(
                        "This account is not authorized for Admin login."
                    );

                }


                if (
                    selectedRole === "staff" &&
                    !isStaff
                ) {

                    throw new Error(
                        "This account is not authorized for Staff login."
                    );

                }


                if (
                    selectedRole === "student" &&
                    (isAdmin || isStaff)
                ) {

                    throw new Error(
                        "Please use the correct Staff or Admin login."
                    );

                }


                /* ---------------------------------
                   LOGIN SUCCESS
                --------------------------------- */

                message.textContent =
                    "Login successful!";


                /* ---------------------------------
                   REDIRECT
                --------------------------------- */

                setTimeout(function () {

                    if (isAdmin) {

                        window.location.href =
                            "admin-dashboard.html";

                    }

                    else if (isStaff) {

                        window.location.href =
                            "staff-dashboard.html";

                    }

                    else {

                        window.location.href =
                            "dashboard.html";

                    }

                }, 800);

            }


            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                message.textContent =
                    error.message ||
                    "Unable to login.";

            }

        }
    );

}


/* =====================================================
   EMAIL CONFIRMATION
===================================================== */

const confirmForm =
    document.getElementById("confirmForm");


if (confirmForm) {

    confirmForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const code =
                document.getElementById(
                    "confirmationCode"
                ).value;


            const email =
                localStorage.getItem(
                    "pendingVerificationEmail"
                );


            const message =
                document.getElementById(
                    "message"
                );


            if (!email) {

                message.textContent =
                    "Email information is missing. Please register again.";

                return;
            }


            try {

                const response =
                    await fetch(
                        cognitoEndpoint,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/x-amz-json-1.1",

                                "X-Amz-Target":
                                    "AWSCognitoIdentityProviderService.ConfirmSignUp"

                            },

                            body: JSON.stringify({

                                ClientId:
                                    COGNITO_CLIENT_ID,

                                Username:
                                    email,

                                ConfirmationCode:
                                    code

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Verification failed."
                    );

                }


                message.textContent =
                    "Account verified successfully! Redirecting to login...";


                localStorage.removeItem(
                    "pendingVerificationEmail"
                );


                setTimeout(function () {

                    window.location.href =
                        "login.html?role=student";

                }, 1500);


            }


            catch (error) {

                console.error(error);

                message.textContent =
                    error.message ||
                    "Unable to verify account.";

            }

        }
    );

}
/* ================================
   FORGOT PASSWORD
================================ */

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const message =
            document.getElementById("message");

        message.textContent =
            "Sending verification code...";

        try {

            const response = await fetch(cognitoEndpoint, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-amz-json-1.1",

                    "X-Amz-Target":
                        "AWSCognitoIdentityProviderService.ForgotPassword"
                },

                body: JSON.stringify({
                    ClientId: COGNITO_CLIENT_ID,
                    Username: email
                })
            });

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to send verification code."
                );

            }

            localStorage.setItem(
                "resetPasswordEmail",
                email
            );

            message.textContent =
                "Verification code sent to your registered email.";

            document.getElementById(
                "resetSection"
            ).style.display = "block";

        } catch (error) {

            console.error(error);

            message.textContent =
                error.message ||
                "Unable to send verification code.";

        }

    });
}


/* ================================
   CONFIRM PASSWORD RESET
================================ */

const confirmResetForm =
    document.getElementById("confirmResetForm");

if (confirmResetForm) {

    confirmResetForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            localStorage.getItem("resetPasswordEmail");

        const code =
            document.getElementById("code").value.trim();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("message");


        if (!email) {

            message.textContent =
                "Email information is missing.";

            return;
        }


        if (newPassword !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;
        }


        message.textContent =
            "Resetting password...";


        try {

            const response = await fetch(cognitoEndpoint, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-amz-json-1.1",

                    "X-Amz-Target":
                        "AWSCognitoIdentityProviderService.ConfirmForgotPassword"
                },

                body: JSON.stringify({

                    ClientId: COGNITO_CLIENT_ID,

                    Username: email,

                    ConfirmationCode: code,

                    Password: newPassword

                })

            });


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Password reset failed."
                );

            }


            message.textContent =
                "Password reset successful! Redirecting to Student Login...";


            localStorage.removeItem(
                "resetPasswordEmail"
            );


            setTimeout(function () {

                window.location.href =
                    "login.html?role=student";

            }, 1500);


        } catch (error) {

            console.error(error);

            message.textContent =
                error.message ||
                "Unable to reset password.";

        }

    });

}