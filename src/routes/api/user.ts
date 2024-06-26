import { Router } from 'express';
import controllers from '../../controllers';
import { mountApiRoute } from '@src/helpers';
import { requireAuthentication, checkRequiredFields } from '@src/middlewares';
import { FileStore } from '@src/middlewares';

const router = Router();
const fileStorage = new FileStore();
const fileuploadMiddleware = fileStorage.initialize();

mountApiRoute(router, 'put', '/:userid', [requireAuthentication], controllers.api.user.update);
mountApiRoute(router, 'delete', '/:userid', [requireAuthentication], controllers.api.user.deleteUser);
mountApiRoute(router, 'put', '/password/reset', [checkRequiredFields.bind(null, ['password', 'token'])], controllers.api.user.resetPassword);
mountApiRoute(router, 'put', '/password/change', [requireAuthentication, checkRequiredFields.bind(null, ['password', 'oldPassword'])], controllers.api.user.changePassword);
mountApiRoute(router, 'put', '/:userid/picture', [fileuploadMiddleware, requireAuthentication], controllers.api.user.updatePicture);
mountApiRoute(router, 'put', '/:userid/username', [requireAuthentication, checkRequiredFields.bind(null, ['username', 'password'])], controllers.api.user.changeUsername);
mountApiRoute(router, 'post', '/:userid/consent', [requireAuthentication, checkRequiredFields.bind(null, ['data', 'emails', 'token'])], controllers.api.user.consent);
mountApiRoute(router, 'put', '/:userid/follow', [requireAuthentication], controllers.api.user.follow);
mountApiRoute(router, 'put', '/:userid/unfollow', [requireAuthentication], controllers.api.user.unFollow);

// Public routes
mountApiRoute(router, 'get', '/validate/username/:username', [], controllers.api.user.checkUsername);
mountApiRoute(router, 'post', '/validate/password', [], controllers.api.user.checkPassword);

export default router;

