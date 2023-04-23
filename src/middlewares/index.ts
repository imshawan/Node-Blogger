import { NextFunction, Response, Request } from 'express';
import { handleApiResponse } from '@src/helpers';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import csurf from 'csurf';

export * from './cors';
export * from './overrides';
export * from './authentication';
export * from './user';
export * from './breadcrumb';

export const checkRequiredFields = function (fields: Array<string>, req: Request, res: Response, next: NextFunction) {
    if (fields && !Array.isArray(fields)) {
        throw new Error('fields required to be checked must be in an array');
    }
    
    let missingFields: Array<string> = [];
    if (fields.length) {
        fields.forEach((field) => {
            if (!req.body[field] || req.body[field] == '') {
                missingFields.push(field)
            }
        });
    }

    if (missingFields.length) {
        return handleApiResponse(HttpStatusCodes.BAD_REQUEST, res, new Error('Required fields were missing from the API call: ' + missingFields.join(', ')));
    } else next();
}

export const requireLogin = async function (req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated() || !req.user) {
        return res.redirect('/signin?redirect=' + req.url);
    }

    next();
}

export const requireAuthentication = async function (req: Request, res: Response, next: NextFunction) {    
    if (!req.isAuthenticated() || !req.user) {
        return handleApiResponse(HttpStatusCodes.UNAUTHORIZED, res, new Error('A valid session key or token was not found with this API call'));
    }

    next();
}

export const applyCSRFMiddleware = async function (req: Request, res: Response, next: NextFunction) {
    // TODO
    // Need to implement cookie options based on the config (https or not and etc)
    const csurfOptions = {
        cookie: true,
    };

    if (req.user) {
        csurf(csurfOptions)(req, res, function(err) {
            if (err) {
                switch (err.code) {
                    case 'EBADCSRFTOKEN':
                        return handleApiResponse(HttpStatusCodes.FORBIDDEN, res);
                    
                    default:
                        return handleApiResponse(HttpStatusCodes.FORBIDDEN, res, new Error('Invalid csrf token'));
                }
            } else {
                return next();
            }
        });
    } else {
        return next();
    }
}