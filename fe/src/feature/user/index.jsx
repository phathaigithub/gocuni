import userReducer, { 
  fetchUserProfile, 
  updateUserProfile,
  clearUserError,
  clearUserSuccess
} from './userSlice';
import userAPI from './userApi';

// Export components
export { default as UserProfile } from './component/UserProfile';

// Export actions
export {
  fetchUserProfile,
  updateUserProfile,
  clearUserError,
  clearUserSuccess
};

// Export API
export { userAPI };

// Export reducer as default
export default userReducer;