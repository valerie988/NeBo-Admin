import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAdminStore } from "./store/authStore";
import Layout            from "./components/layout/Layout";
import LoginPage         from "./pages/LoginPage";
import DashboardPage     from "./pages/DashboardPage";
import UsersPage         from "./pages/UsersPage";
import ProductsPage      from "./pages/ProductsPage";
import OrdersPage        from "./pages/OrdersPage";
import ChatPage          from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import AnalyticsPage     from "./pages/AnalyticsPage";

function Guard({ children }: { children: React.ReactNode }) {
  const { token } = useAdminStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius:"12px", fontSize:"13px" } }}/>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<Guard><Layout/></Guard>}>
          <Route index              element={<DashboardPage/>}/>
          <Route path="users"       element={<UsersPage/>}/>
          <Route path="products"    element={<ProductsPage/>}/>
          <Route path="orders"      element={<OrdersPage/>}/>
          <Route path="chat"        element={<ChatPage/>}/>
          <Route path="notifications" element={<NotificationsPage/>}/>
          <Route path="analytics"   element={<AnalyticsPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
