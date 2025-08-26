import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CookiesProvider } from "react-cookie";
import Home from "./Home.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookiesProvider
      defaultSetOptions={{
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "lax",
      }}
    >
      <Home />
    </CookiesProvider>
  </StrictMode>,
);
