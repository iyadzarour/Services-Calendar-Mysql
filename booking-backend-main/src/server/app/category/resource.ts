import express from "express";
import CategoriesControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
// import { checkAuth, validateToken } from "../middlewares/authMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/categories",
    injectService,
    ValidateSchema.prepare(schemas.addCategorySchema),
    CategoriesControllers.addCategory
  );
  app.get(
    "/categories",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getCategoriesSchema, 'query'),
    CategoriesControllers.getCategories
  );
  app.put(
    "/categories/:categoryId",
    injectService,
    ValidateSchema.prepare(schemas.updateCategorySchema),
    CategoriesControllers.updateCategory
  );
  app.delete(
    "/categories/:categoryId",
    injectService,
    CategoriesControllers.deleteCategory
  );
  app.get(
    "/categories/services",
    injectService,
    // validateToken,
    // checkAuth,
    CategoriesControllers.getServices
  );
};
