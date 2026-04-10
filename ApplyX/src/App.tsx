import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Home     from "./pages/Home";
import Calendar from "./pages/Calendar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/"        element={<Login />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas — redirigen al login si no hay token */}
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute><Calendar /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;