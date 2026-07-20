function login(event) {
    event.preventDefault(); // stop form reload

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    // Validation
    if (email === "" || password === "") {
        alert("Please enter email and password");
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if (data.status === "success") {
            // Save user info for use across all pages
            localStorage.setItem("user_id",    data.user_id);
            localStorage.setItem("user_name",  data.user_name);
            localStorage.setItem("user_email", data.user_email);

            // Redirect to emotion page
            window.location.href = "/emotion-page";
        } else {
            alert(data.message || "Invalid Login");
        }
    })
    .catch(error => {
        console.error(error);
        alert("Server Connection Error");
    });
}