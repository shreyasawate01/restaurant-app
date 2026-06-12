import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ChefDashboard from './pages/ChefDashboard';
import CustomerMenu from './pages/CustomerMenu';
import OrderStatus from './pages/OrderStatus';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chef/:restaurantId" element={<ChefDashboard />} />
        <Route path="/menu/:restaurantId/:tableNumber" element={<CustomerMenu />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;