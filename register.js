function register(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    if (name === "" || email === "" || password === "") {
        alert("All fields required");
        return;
    }

    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.status === "success") {
            alert("Registration Successful");

            // redirect to login page
            window.location.href = "/";

        } else {
            alert("Registration Failed");
        }

    })
    .catch(err => {
        console.error(err);
        alert("Server error");
    });
}