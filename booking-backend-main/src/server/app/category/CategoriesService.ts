import { CategoryDao, Category } from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class CategoryService {
  constructor(private categoryDao: CategoryDao) {}

  async addCategory(category: Category) {
    return this.categoryDao
      .addCategory(category)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          err,
          500
        );
      });
  }

  async getCategoryById(id: string) {
    return this.categoryDao
      .getCategoryById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateCategory(id: string, newCategory: Category) {
    return this.categoryDao
      .updateCategory(id, newCategory)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          err,
          500
        );
      });
  }

  async getCategories(page: number, limit: number, search?: string) {
    const [data, count] = await Promise.all([
      this.categoryDao.getCategories(page, limit, search).then((data) => {
        return data;
      }),
      this.categoryDao.getCategoriesCount(search).then((data: number) => {
        return data;
      }),
    ]);

    return { data, count };
  }

  async deleteCategory(id: string) {
    return this.categoryDao
      .deleteCategory(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          err,
          500
        );
      });
  }

  async getServices() {
    const data = await this.categoryDao.getServices().then((data) => {
      return data;
    });

    return data;
  }
}
