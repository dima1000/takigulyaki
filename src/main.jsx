import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.css";

function ErrorBoundary({ children }) {
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    function onError(e) {
      setErr(e?.error || e?.reason || e?.message || String(e));
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    };
  }, []);

  if (err) {
    return (
      <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
        <h2>Произошла ошибка на странице</h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #fecaca",
          }}
        >
          {String(err && err.stack ? err.stack : err)}
        </pre>
      </div>
    );
  }
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
