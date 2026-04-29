import React from "react";
import { createRoot } from "react-dom/client";
import App from "./AppRuntime.jsx";
import "./original-plus.css";
import { installResourceVisibilityPatch } from "./resourceVisibility.js";
import { installEvilRebirthPatch } from "./evilRebirthPatch.js";

createRoot(document.getElementById("root")).render(<App />);
installResourceVisibilityPatch();
installEvilRebirthPatch();
