import { NextFunction, Request, Response } from 'express';

const tryCatchErrorDecorator = (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor => {
    const fn = descriptor.value;

    return {
        ...descriptor,
        async value(req: Request, res: Response, next: NextFunction): Promise<any> {
            try {
                return await fn.call(this, req, res, next);
            } catch (error) {
                console.error(error);
                next(error);
            }
        },
    };
};

export default tryCatchErrorDecorator;
