import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyRequests from "./pages/MyRequests";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import SpecialistProfile from "./pages/SpecialistProfile";
import Specialists from "./pages/Specialists";
import Managers from "./pages/Managers";
import ManagerProfile from "./pages/ManagerProfile";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="about" element={<About />} />
          <Route
            path="contact"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <Contact />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="my-requests"
            element={
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <MyRequests />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="specialists"
            element={
              <RoleProtectedRoute
                allowedRoles={["manager", "admin", "developer"]}
              >
                <Specialists />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="specialists/:developerId"
            element={
              <RoleProtectedRoute
                allowedRoles={["manager", "admin", "developer"]}
              >
                <SpecialistProfile />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="managers"
            element={
              <RoleProtectedRoute
                allowedRoles={["customer", "manager", "admin", "developer"]}
              >
                <Managers />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="managers/:managerId"
            element={
              <RoleProtectedRoute
                allowedRoles={["customer", "manager", "admin", "developer"]}
              >
                <ManagerProfile />
              </RoleProtectedRoute>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="profile"
            element={
              <RoleProtectedRoute
                allowedRoles={["customer", "manager", "developer", "admin"]}
              >
                <Profile />
              </RoleProtectedRoute>
            }
          />
        </Route>

        <Route path="/admin" element={<Admin />} />

        <Route
          path="/developer-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["developer"]}>
              <DeveloperDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["manager", "admin"]}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/orders"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
