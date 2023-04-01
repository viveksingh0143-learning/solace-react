import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/main-layout";
import "./app.scss";

import NotFoundPage from "./pages/error";
import HomePage from "./pages/home";
import SupportPage from "./pages/support";

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/support" element={<SupportPage />}></Route>
        <Route path="/404-not-found" element={<NotFoundPage />}></Route>
        <Route path="*" element={<Navigate to="/404-not-found" />} />
      </Route>
    </Routes>
  );
};

export default App;
