import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationProvider } from './contexts/LocationContext';
import { FilterProvider } from './contexts/FilterContext';
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MapPage } from './pages/MapPage';
import { AuthPage } from './pages/AuthPage';
import { PostPage } from './pages/PostPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LocationProvider>
            <FilterProvider>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/tos" element={<TermsPage />} />
              </Routes>
            </FilterProvider>
          </LocationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
