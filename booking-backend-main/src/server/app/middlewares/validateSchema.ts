import { Response, Request, NextFunction } from "express";
import Joi from "joi";
import ValidateService from "../../utils/validateService";

type KeyValidateType = "body" | "query";

class ValidateSchema {
  static prepare(
    schema: Joi.ObjectSchema<any>,
    keyValidate: KeyValidateType = "body",
    context?: Joi.Context
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await ValidateService.validate(req[keyValidate], schema, context);
        next();
      } catch (error: any) {
        next(error);
      }
    };
  }
}

export default ValidateSchema;
