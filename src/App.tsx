import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationProvider } from './contexts/LocationContext';
import { FilterProvider } from './contexts/FilterContext';
import { DiscoverPage } from './pages/DiscoverPage';
import { MapPage } from './pages/MapPage';
import { AuthPage } from './pages/AuthPage';
import { PostPage } from './pages/PostPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { EditItemPage } from './pages/EditItemPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LocationProvider>
            <FilterProvider>
              <Routes>
              <Route path="/" element={<DiscoverPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
              <Route path="/item/:id/edit" element={<EditItemPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Routes>
            </FilterProvider>
          </LocationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
