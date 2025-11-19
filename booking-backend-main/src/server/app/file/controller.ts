import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import {
  AddEmailConfigRequest,
} from "../../../database-client/src/Schema";
import { ServiceContainer } from "../clients";

class EmailControllers {
  @tryCatchErrorDecorator
  static async addEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to add email config';
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
    const form = request.body as unknown as AddEmailConfigRequest;
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.addEmailConfig(form);

    res.status(200).json(data);
  }
}

export default EmailControllers;
