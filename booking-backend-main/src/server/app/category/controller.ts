import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer } from "../clients";
import { Category, DisplayStatus, PaginatedForm } from "../../../database-client/src/Schema";
import { PaginatedResponse } from "./dto";

class CategoriesControllers {
  @tryCatchErrorDecorator
  static async getCategories(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Category'];

    /*
        #swagger.description = 'Endpoint to get all categories';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const {
      page = 1,
      limit = 10,
      search,
    } = request.query as unknown as PaginatedForm;
    const service = (request as any).service as ServiceContainer;
    const { data, count } = await service.categoryService.getCategories(
      page,
      limit,
      search
    );

    const paginatedResult = new PaginatedResponse<Category>(
      data,
      Number(page),
      Number(limit),
      count
    );

    res.status(200).json(paginatedResult);
  }

  @tryCatchErrorDecorator
  static async addCategory(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Category'];

    /*
        #swagger.description = 'Endpoint to add category';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Category;
    const service = (request as any).service as ServiceContainer;
    const newCategory: Category = {
      name: form.name,
      category: form.category,
      choices: "choices" in form ? form.choices : "Single selection",
      selection_is_optional:
        "selection_is_optional" in form ? form.selection_is_optional : true,
      show_price: "show_price" in form ? form.show_price : true,
      show_appointment_duration:
        "show_appointment_duration" in form
          ? form.show_appointment_duration
          : false,
      no_columns_of_services: form.no_columns_of_services || 0,
      full_screen: "full_screen" in form ? form.full_screen : true,
      folded: "folded" in form ? form.folded : false,
      online_booking: "online_booking" in form ? form.online_booking : true,
      remarks: form.remarks || "",
      unique_id: form.unique_id,
      display_status: "display_status" in form ? form.display_status : DisplayStatus.SHOW,
      advanced_settings: form.advanced_settings,
      services: form.services,
    };
    const data = await service.categoryService.addCategory(newCategory);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateCategory(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Category'];

    /*
        #swagger.description = 'Endpoint to update category';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Category;
    const service = (request as any).service as ServiceContainer;
    const { categoryId } = request.params;
    const newCategory: Category = {
      name: form.name,
      category: form.category,
      choices: "choices" in form ? form.choices : "Single selection",
      selection_is_optional:
        "selection_is_optional" in form ? form.selection_is_optional : true,
      show_price: "show_price" in form ? form.show_price : true,
      show_appointment_duration:
        "show_appointment_duration" in form
          ? form.show_appointment_duration
          : false,
      no_columns_of_services: form.no_columns_of_services || 0,
      full_screen: "full_screen" in form ? form.full_screen : true,
      folded: "folded" in form ? form.folded : false,
      online_booking: "online_booking" in form ? form.online_booking : true,
      remarks: form.remarks || "",
      unique_id: form.unique_id,
      display_status: "display_status" in form ? form.display_status : DisplayStatus.SHOW,
      advanced_settings: form.advanced_settings,
      services: form.services,
    };
    const data = await service.categoryService.updateCategory(
      categoryId,
      newCategory
    );

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteCategory(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
        // #swagger.tags = ['Category'];

    /*
        #swagger.description = 'Endpoint to delete all category';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.categoryService.deleteCategory(
      request.params.categoryId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  @tryCatchErrorDecorator
  static async getServices(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Category'];

    /*
        #swagger.description = 'Endpoint to get all services';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.categoryService.getServices();

    res.status(200).json(data);
  }
}

export default CategoriesControllers;
