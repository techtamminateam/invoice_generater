import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Login from "./login";
import TimesheetApp from "./App";

function Main() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('loggedInUser')));
  const handleLoginSuccess = (userData) => {
  // Set user so TimesheetApp renders
  setUser(userData);

  // Store full user
  localStorage.setItem('loggedInUser', JSON.stringify(userData));

  // Store fields for role-based tabs
  localStorage.setItem("role", userData.role);
  localStorage.setItem("id", userData.id);
  localStorage.setItem("email", userData.email);
  localStorage.setItem("name", userData.name);
};

  return user ? (
    <TimesheetApp setUser={setUser} onLoginSuccess={handleLoginSuccess} />

  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
