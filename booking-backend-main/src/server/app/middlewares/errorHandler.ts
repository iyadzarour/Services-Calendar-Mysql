import { ErrorRequestHandler } from 'express';
import httpErrors from 'http-errors';
import { ClientError, ValidationError } from '../../utils/exceptions';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const status = err.status
        ? err.status
        : err.code
        ? typeof err.code == 'number'
            ? err.code >= 100 && err.code < 600
                ? err.code
                : 500
            : 400
        : 500;
    const httpError = httpErrors(status);
    const errorMessage = err.message || httpError.message;
    const response = { code: status };

    if (err instanceof ValidationError) {
        Object.assign(response, { message: httpError.message });
        Object.assign(response, { errorValidation: err.validationErrors });
    } else if (err instanceof ClientError) {
        Object.assign(response, { message: errorMessage });
        console.error(response)
        // getLogger().info(errorMessage, {
        //     url: req.originalUrl,
        //     method: req.method,
        // });
    } else {
        Object.assign(response, { message: errorMessage });
        console.error(response)
        // getLogger().error(err.stack, {
        //     url: req.originalUrl,
        //     method: req.method,
        // });
    }

    res.status(status);
    res.json(response);
};

export default errorHandler;
