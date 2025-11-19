import { Category, ExtendedService } from "../../Schema";
import { CategoriesAction } from "../actions";

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  updateCategoryLoading: boolean;
  deleteCategoryLoading: boolean;
  addCategoryLoading: boolean;
  services: ExtendedService[];
  servicesLoading: boolean;
}

const initialState: CategoriesState = {
  categories: [],
  loading: true,
  updateCategoryLoading: false,
  deleteCategoryLoading: false,
  addCategoryLoading: false,
  services: [],
  servicesLoading: true,
};

const categoriesReducer = (
  state: CategoriesState = initialState,
  action: CategoriesAction
): CategoriesState => {
  switch (action.type) {
    case "categories/GET_ALL":
      return {
        ...state,
        loading: true,
      };
    case "categories/GET_ALL_DONE":
      return {
        ...state,
        loading: false,
        categories: action.payload,
      };
    case "categories/UPDATE_ONE":
      return {
        ...state,
        updateCategoryLoading: true,
      };
    case "categories/UPDATE_ONE_DONE": {
      let updatedCategories = state.categories;
      if (action.category && action.category._id) {
        updatedCategories = state.categories.map((category) =>
          action.category && category._id === action.category._id
            ? action.category
            : category
        );
      }
      return {
        ...state,
        updateCategoryLoading: false,
        categories: updatedCategories,
      };
    }
    case "categories/DELETE_ONE":
      return {
        ...state,
        deleteCategoryLoading: true,
      };
    case "categories/DELETE_ONE_DONE": {
      let filteredCategories = state.categories;
      if (action.id) {
        filteredCategories = state.categories.filter(
          (category) => category._id !== action.id
        );
      }
      return {
        ...state,
        deleteCategoryLoading: false,
        categories: filteredCategories,
      };
    }
    case "categories/ADD_ONE":
      return {
        ...state,
        addCategoryLoading: true,
      };
    case "categories/ADD_ONE_DONE": {
      return action.category?._id
        ? {
            ...state,
            addCategoryLoading: false,
            categories: [...state.categories, action.category],
          }
        : {
            ...state,
            addCategoryLoading: false,
          };
    }
    case "categories/GET_SERVICES":
      return {
        ...state,
        servicesLoading: true,
      };
    case "categories/GET_SERVICES_DONE":
      return {
        ...state,
        servicesLoading: false,
        services: action.payload,
      };
    default:
      return state;
  }
};

export default categoriesReducer;
