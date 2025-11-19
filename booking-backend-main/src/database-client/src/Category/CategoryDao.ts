import { Category, ExtendedService, Service } from "../Schema";

export interface CategoryDao {
  getCategories(
    page: number,
    limit: number,
    search?: string
  ): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  getCategoriesCount(search?: string): Promise<number>;
  getServiceByCategoryIdAndServiceId(
    categoryId: string,
    serviceId: string
  ): Promise<Service | null>;
  addCategory(category: Partial<Category>): Promise<Category>;
  updateCategory(id: string, newCategory: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<Category | null>;
  getServices(): Promise<ExtendedService[] | null>;
}
