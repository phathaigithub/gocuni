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
import ProtectedRoute from './routes/ProtectedRoute';
import CategoryPage from './feature/category/component/CategoryPage'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets//css/style.css';
import CreatePost from './feature/post/component/CreatePost';
import EditPost from './feature/post/component/EditPost';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AdminLayout from './feature/admin/component/common/AdminLayout';
import AdminUserList from './feature/admin/component/user/AdminUserList';
import AdminUserForm from './feature/admin/component/user/AdminUserForm';
import AdminPostList from './feature/admin/component/post/AdminPostList';
import AdminPostForm from './feature/admin/component/post/AdminPostForm';
import AdminPostApproval from './feature/admin/component/post/AdminPostApproval';
import AdminCategoryList from './feature/admin/component/category/AdminCategoryList';
import AdminCommentList from './feature/admin/component/comment/AdminCommentList';

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
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="ROLE_ADMIN">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminUserList />} />
                  <Route path="users" element={<AdminUserList />} />
                  <Route path="users/create" element={<AdminUserForm />} />
                  <Route path="users/edit/:id" element={<AdminUserForm />} />
                  
                  {/* Post routes */}
                  <Route path="posts" element={<AdminPostList />} />
                  <Route path="posts/create" element={<AdminPostForm />} />
                  <Route path="posts/edit/:id" element={<AdminPostForm />} />
                  <Route path="posts/approval" element={<AdminPostApproval />} />
                  
                  {/* Thêm các routes cho categories và comments */}
                  <Route path="categories" element={<AdminCategoryList />} />
                  <Route path="comments" element={<AdminCommentList />} />
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
