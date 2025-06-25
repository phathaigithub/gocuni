import categoryReducer, { 
  fetchAllCategories, 
  fetchCategoryById,
  fetchPostsByCategory,
  clearCategoryError
} from './categorySlice';

export {
  fetchAllCategories,
  fetchCategoryById,
  fetchPostsByCategory,
  clearCategoryError
};

export default categoryReducer;