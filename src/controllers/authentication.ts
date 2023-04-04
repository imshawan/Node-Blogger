import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { Request, Response } from 'express';

const signIn = async function (req: Request, res: Response) {
    const {redirect} = req.query;
    const page = {
        title: 'Sign in',
        redirect,
    };

    res.render('signin', page);
}

const consent = async function (req: Request, res: Response) {
    const {token} = req.query;

    const page = {
        title: 'consent'
    };

    res.render('consent', page);
}

const register = async function (req: Request, res: Response) {
    const page = {
        title: 'Register'
    };

    res.render('register', page);
}

export default {
    signIn, register, consent
  } as const;