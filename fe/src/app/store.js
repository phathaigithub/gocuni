import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../feature/auth';
import postReducer from '../feature/post';
import userReducer from '../feature/user';
import categoryReducer from '../feature/category'; // Thêm reducer mới

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    user: userReducer,
    category: categoryReducer // Thêm vào store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;