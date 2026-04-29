import React from "react";
import { createRoot } from "react-dom/client";
import App from "./AppRuntime.jsx";
import "./styles.css";
import "./medieval.css";

createRoot(document.getElementById("root")).render(<App />);
