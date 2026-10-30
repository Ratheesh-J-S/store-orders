import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <div className="pos-app">
      <Header />
      <main className="container-fluid px-3 px-lg-4 py-4">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
