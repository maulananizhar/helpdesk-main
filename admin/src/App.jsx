import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";
import { PICContext } from "./context/PICContext";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import Formulir from "./pages/admin/Formulir";
import UserLists from "./pages/admin/UserLists";
import RegistUser from "./pages/admin/RegistUser";
import Login from "./pages/Login";
import EditFormulir from "./pages/admin/EditFormulir";
import JenisLayanan from "./pages/admin/jenislayanan";
import FormulirPIC from "./pages/PIC/FormulirPIC";
import EditFormulirPIC from "./pages/PIC/EditFormulirPIC";
import DashboardPIC from "./pages/PIC/DashboardPIC";
import EditUser from "./pages/admin/EditUser";
import DataFormulir from "./pages/admin/DataFormulir";
import UlasanHelpdesk from "./pages/admin/UlasanHelpdesk";
import UlasanPIC from "./pages/admin/UlasanPIC";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { pToken } = useContext(PICContext);

  return aToken || pToken ? (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen w-full">
      <ToastContainer />
      <NavBar />
      <div className="flex flex-col sm:flex-row">
        <Sidebar />
        <div className="pt-20 px-6 w-full sm:ml-64">
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-pic" element={<DashboardPIC />} />
            <Route path="/form" element={<Formulir />} />
            <Route path="/regist-user" element={<RegistUser />} />
            <Route path="/user-lists" element={<UserLists />} />
            <Route path="/edit-form/:id" element={<EditFormulir />} />
            <Route path="/layanan" element={<JenisLayanan />} />
            <Route path="/ulasan-helpdesk" element={<UlasanHelpdesk />} />
            <Route path="/ulasan-pic" element={<UlasanPIC />} />
            <Route path="/formulir-pic" element={<FormulirPIC />} />
            <Route path="/edit-form-pic/:id" element={<EditFormulirPIC />} />
            <Route path="/edit-user/:id" element={<EditUser />} />
            <Route path="/data-formulir" element={<DataFormulir />} />
          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen w-full">
      <ToastContainer />
      <Login />
    </div>
  );
};

export default App;
