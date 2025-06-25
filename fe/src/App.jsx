import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import { AuthProvider } from './context/AuthContext';
import PersistLogin from './components/common/PersistLogin';
import Login from './feature/auth/component/LoginPage';
import Register from './feature/auth/component/Register';
import ForgotPassword from './feature/auth/component/ForgotPassword';
import ChangePassword from './feature/auth/component/ChangePassword';
import ResetPassword from './feature/auth/component/ResetPassword';
import { UserProfile } from './feature/user';
import { PostDetail } from './feature/post';
import HomePage from './pages/HomePage';
import ClientLayout from './components/client/ClientLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import PostManagement from './pages/admin/PostManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ProtectedRoute from './routes/ProtectedRoute';
import CategoryPage from './feature/category/component/CategoryPage'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets//css/style.css';
import CreatePost from './feature/post/component/CreatePost';
import EditPost from './feature/post/component/EditPost';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route element={<PersistLogin />}>
                {/* Client Routes */}
                <Route path="/" element={<ClientLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="post/create" element={<CreatePost />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/post/edit/:id" element={
                    <ProtectedRoute>
                      <EditPost />
                    </ProtectedRoute>
                  } />
                  <Route path="category/:id" element={<CategoryPage />} />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="change-password" element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  } />
                  <Route path="reset-password" element={<ResetPassword />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    {/* <AdminLayout /> */}
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="posts" element={<PostManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
