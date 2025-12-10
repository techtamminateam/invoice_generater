const API_URL = "http://localhost:5000/api";

export async function createUser(userData) {
  const res = await fetch(`${API_URL}/register`, {    // ✅ WORKS
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Failed to register");
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/login`, {       // ✅ FIXED PATH
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}
