import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ParkingDetails from './pages/ParkingDetails';
import Bookings from './pages/Bookings';
import AdminPage from './pages/AdminPage';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={!user ? <Login /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} 
          />
          <Route 
            path="/dashboard" 
            element={user && user.role !== 'admin' ? <Dashboard /> : user && user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/parking/:id" 
            element={user && user.role !== 'admin' ? <ParkingDetails /> : user && user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/bookings" 
            element={user && user.role !== 'admin' ? <Bookings /> : user && user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
