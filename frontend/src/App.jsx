// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// src klasörünün altındaki klasörlerden importlar './' ile başlar
import Navbar from './components/Layout/Navbar.jsx'; // Uzantıyı eklemek de bir seçenektir
import PrivateRoute from './components/Routing/PrivateRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CreatePostPage from './pages/CreatePostPage.jsx';
import EditPostPage from './pages/EditPostPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import BattlePage from './pages/BattlePage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';

// ... function App() ...
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/battle" element={<BattlePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage selfProfile={false} />} />

            <Route element={<PrivateRoute />}>
              <Route path="/create-post" element={<CreatePostPage />} />
              <Route path="/posts/:postId/edit" element={<EditPostPage />} />
              <Route path="/my-profile" element={<UserProfilePage selfProfile={true} />} />
            </Route>

            <Route path="*" element={
              <div className="text-center py-10">
                <h1 className="text-4xl font-bold text-gray-700">404</h1>
                <p className="text-xl text-gray-600 mt-2">Aradığınız sayfa bulunamadı.</p>
                <Link to="/" className="mt-4 inline-block btn-primary px-6 py-2 text-white rounded">Ana Sayfaya Dön</Link> {/* py-2 ve text-white eklendi */}
              </div>
            } />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white text-center p-4">
          Kalem Meydanı © {new Date().getFullYear()}
        </footer>
      </div>
    </Router>
  );
}

export default App;