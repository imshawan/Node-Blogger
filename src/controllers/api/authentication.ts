import { NextFunction, Request, Response } from "express";
import { handleApiResponse } from "@src/helpers";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { utils, register as RegisterUser } from "@src/user";
import { IUserRegisteration } from "@src/types";
import passport from "passport";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
    const {redirect} = req.body;

    passport.authenticate('local', async function (err?: Error, userData?: any, info?: object) {
        if (err) {
            return handleApiResponse(HttpStatusCodes.UNAUTHORIZED, res, new Error(err.message));
        }

        if (req.body.rememberme) {
            // TODO
        }
        
        req.logIn(userData, function(err) {
            if (err) { return next(err); }
            return res.json({next: redirect || '/'});
        });
    })(req, res, next);
}

const signout = async (req: Request, res: Response) => {
    req.logOut((err) => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
}

const register = async (req: Request, res: Response) => {
    const userData: IUserRegisteration = req.body;
    let {username, email, password, confirmpassword} = userData;

    utils.validatePassword(password);
    await utils.validateUsername(username);
    await utils.checkEmailAvailability(email);

    if (!utils.isValidEmail(email)) {
        throw new Error('Invalid email id');
    }
    if (password != confirmpassword) {
        throw new Error('Passwords do not match');
    }
    
    const data = await RegisterUser(userData);

    // TODO introduce the token mechanism for consents (per user)
    handleApiResponse(HttpStatusCodes.OK, res, {next: `${req.url}/complete/token=${data.token}`});
}

export default {
    signIn, register, signout
  } as const;