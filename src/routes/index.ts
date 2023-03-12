import { Router } from 'express';
import controllers from '../controllers';
import {CORS, corsWithOptions} from '../middlewares';
import apiRouter from './api/blog';
import pageRouter from './pageRoutes';

const router = Router();

router.use('/', pageRouter);
router.use('/api', apiRouter);

export default router;