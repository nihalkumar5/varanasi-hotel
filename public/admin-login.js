const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

checkExistingSession();

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = String(usernameInput?.value || "").trim() || "admin";
  const password = String(passwordInput?.value || "").trim();
  if (!password) {
    setMessage("Enter the admin password to continue.", "error");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || "Invalid admin credentials.");
    }

    setMessage("Signed in. Opening the admin portal...", "success");
    window.location.assign("/admin");
  } catch (error) {
    setMessage(error?.message || "Could not sign in.", "error");
    setLoading(false);
    usernameInput?.focus();
    usernameInput?.select?.();
    passwordInput?.focus();
    passwordInput?.select();
  }
});

async function checkExistingSession() {
  try {
    const response = await fetch("/api/admin/session", {
      credentials: "same-origin"
    });
    if (response.ok) {
      window.location.assign("/admin");
      return;
    }

    if (response.status === 503) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.error || "Admin authentication is not configured on the server.", "error");
    }
  } catch (error) {
    // Ignore network failures and leave the user on the login page.
  }
}

function setMessage(message, tone) {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = message;
  loginMessage.className = `helper-text ${tone}`;
}

function setLoading(isLoading) {
  if (loginButton) {
    loginButton.disabled = isLoading;
    loginButton.textContent = isLoading ? "Signing in..." : "Sign in";
  }

  if (passwordInput) {
    passwordInput.disabled = isLoading;
  }

  if (usernameInput) {
    usernameInput.disabled = isLoading;
  }
}
