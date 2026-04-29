import React from "react";
import { createRoot } from "react-dom/client";
import App from "./AppRuntime.jsx";
import "./styles.css";
import "./original-plus.css";
import "./money-focus.css";
import { installResourceVisibilityPatch } from "./resourceVisibility.js";

createRoot(document.getElementById("root")).render(<App />);
installResourceVisibilityPatch();
