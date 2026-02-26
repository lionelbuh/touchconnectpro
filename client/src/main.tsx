import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const hash = window.location.hash;
if (hash && hash.includes("type=recovery") && hash.includes("access_token")) {
  const currentPath = window.location.pathname;
  if (currentPath !== "/reset-password") {
    window.location.replace("/reset-password" + hash);
  } else {
    createRoot(document.getElementById("root")!).render(<App />);
  }
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
