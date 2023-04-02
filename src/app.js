import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/mainLayout";
import "./app.scss";

import SolaceCallSubscriberPage from "./pages/solaceCallSubscriberPage";
import HomePage from "./pages/homePage";
import SupportPage from "./pages/supportpage";
import NotFoundPage from "./pages/notFoundPage";
import { solaceClient } from "./services/solaceClient";
import { useEffect } from "react";

const App = () => {

  useEffect(() => {
    solaceClient.connect();
    return () => {
      solaceClient.disconnect();
    };
  })

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/solace-call-subscriber" element={<SolaceCallSubscriberPage />}></Route>
        <Route path="/support" element={<SupportPage />}></Route>
        <Route path="/404-not-found" element={<NotFoundPage />}></Route>
        <Route path="*" element={<Navigate to="/404-not-found" />} />
      </Route>
    </Routes>
  );
};

export default App;
