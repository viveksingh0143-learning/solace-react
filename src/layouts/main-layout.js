import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/navbar";

export default function MainLayout() {
  return (
    <>
      <div className="min-h-full">
        <Navbar></Navbar>
        <Outlet />
      </div>
    </>
  );
}
