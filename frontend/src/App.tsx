import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { IncidentPage } from './pages/IncidentPage';
import { AdminPage } from './pages/AdminPage';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <h1>Incident Bridge</h1>
      <nav>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Raise Incident
        </Link>
        <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>
          Admin
        </Link>
      </nav>
    </header>
  );
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<IncidentPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default App;
