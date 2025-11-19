import { Category, ExtendedService } from "../../Schema";
import { Dispatch } from "redux";
import { API_URL } from "../network/api";
import { getProfile } from "../../utils";

const GET_CATEGORIES = "categories/GET_ALL" as const;
const GET_CATEGORIES_DONE = "categories/GET_ALL_DONE" as const;
const UPDATE_CATEGORY = "categories/UPDATE_ONE" as const;
const UPDATE_CATEGORY_DONE = "categories/UPDATE_ONE_DONE" as const;
const DELETE_CATEGORY = "categories/DELETE_ONE" as const;
const DELETE_CATEGORY_DONE = "categories/DELETE_ONE_DONE" as const;
const ADD_CATEGORY = "categories/ADD_ONE" as const;
const ADD_CATEGORY_DONE = "categories/ADD_ONE_DONE" as const;
const GET_SERVICES = "categories/GET_SERVICES" as const;
const GET_SERVICES_DONE = "categories/GET_SERVICES_DONE" as const;


export const addCategory = () => ({
  type: ADD_CATEGORY,
});

export const addCategoryDone = (category: Category | null) => ({
  type: ADD_CATEGORY_DONE,
  category,
});

export const deleteCategory = () => ({
  type: DELETE_CATEGORY,
});

export const deleteCategoryDone = (id: string | null) => ({
  type: DELETE_CATEGORY_DONE,
  id,
});

export const updateCategory = () => ({
  type: UPDATE_CATEGORY,
});

export const updateCategoryDone = (category: Category | null) => ({
  type: UPDATE_CATEGORY_DONE,
  category,
});

export const getCategories = () => ({
  type: GET_CATEGORIES,
});

export const getCategoriesDone = (data: Category[]) => ({
  type: GET_CATEGORIES_DONE,
  payload: data,
});

export const fetchCategories = (page: number = 1, limit: number = 10) => {
  return async (dispatch: Dispatch) => {
    dispatch(getCategories());

    try {
      const response = await fetch(
        `${API_URL}/categories?page=${page}&limit=${limit}`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getCategoriesDone(data.data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getCategoriesDone([]));
    }
  };
};

export const updateCategoryRequest = (id: string, category: Category) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateCategory());

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(category),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(updateCategoryDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(updateCategoryDone(null));
    }
  };
};

export const deleteCategoryRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteCategory());

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteCategoryDone(id));
      else {
        dispatch(deleteCategoryDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(deleteCategoryDone(null));
    }
  };
};

export const createCategoryRequest = (category: Category) => {
  return async (dispatch: Dispatch) => {
    dispatch(addCategory());

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        body: JSON.stringify(category),
        headers: { "Content-Type": "application/json", "x-user-role": getProfile()?.role },
      });
      const data = await response.json();

      dispatch(addCategoryDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(addCategoryDone(null));
    }
  };
};

export const getServices = () => ({
  type: GET_SERVICES,
});

export const getServicesDone = (data: ExtendedService[]) => ({
  type: GET_SERVICES_DONE,
  payload: data,
});

export const fetchServices = () => {
  return async (dispatch: Dispatch) => {
    dispatch(getServices());

    try {
      const response = await fetch(
        `${API_URL}/categories/services`, {
          headers: { "x-user-role": getProfile()?.role },
        }
      );
      const data = await response.json();

      dispatch(getServicesDone(data));
    } catch (error) {
      console.error("Error fetching categories:", error);

      dispatch(getServicesDone([]));
    }
  };
};

export type CategoriesAction = ReturnType<
  | typeof getCategories
  | typeof getCategoriesDone
  | typeof updateCategory
  | typeof updateCategoryDone
  | typeof deleteCategory
  | typeof deleteCategoryDone
  | typeof addCategory
  | typeof addCategoryDone
  | typeof getServices
  | typeof getServicesDone
>;
