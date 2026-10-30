import { Route, Routes } from "react-router-dom";
import StoreBilling from "../pages/admin/StoreBilling";
import { AppLayout } from "../components/layout/AppLayout";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<StoreBilling />} />
      </Route>
    </Routes>
  );
}
