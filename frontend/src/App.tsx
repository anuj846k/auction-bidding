import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { LandingPage } from './pages/LandingPage';
import { AuctionsPage } from './pages/AuctionsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MyBidsPage } from './pages/MyBidsPage';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './auth/AuthContext';
import { Toaster } from 'sonner';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/bids" element={<MyBidsPage />} />
          </Routes>
        </div>
        <Toaster
          richColors
          theme="dark"
          position="top-right"
          toastOptions={{
            className:
              'border border-emerald-500/20 bg-black/80 text-foreground backdrop-blur',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
