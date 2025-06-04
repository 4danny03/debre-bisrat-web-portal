import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateEnv } from "./lib/env";

// Validate environment variables before starting the app
validateEnv();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    DEB-1
  </React.StrictMode>
    <div className="w-[71px] h-[55px]"></div>
  </React.StrictMode>,
main
);
