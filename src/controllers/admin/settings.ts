import { NextFunction, Request, Response } from "express";
import { AppKeysArray, MutableObject } from "@src/types";
import {data as sidebarData} from "./sidebar";
import { SideBar } from "@src/utilities";
import { application } from "@src/application";
import {sorting, availableRegisterationTypes, passwordScoresWithMessage, fileSizeUnits, 
    availableEmailServices, emailServiceAuthenticationTypes} from './common';

const BASE = 'settings';

const site = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const siteAppKeysArray: AppKeysArray = [
        "siteName",
        "siteNameUrl",
        "siteShortName",
        "description",
        "logo",
        "favicon",
        "altLogoText",
        "logoRedirectionUrl"
    ];

    pageData.title = 'Site settings';
    pageData.sidebar = sidebar.get('settings:site');
    pageData.data = retriveApplicationPropertiesFiltered(siteAppKeysArray);

    res.render(BASE + '/site/index', pageData);
}

const blog = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const blogAppkeysArray: AppKeysArray = [
      "sorting",
      "allowComments",
      "allowDislike",
      "allowGuestComments",
      "allowLike",
      "allowTags",
    ];

    pageData.title = 'Blog settings';
    pageData.sidebar = sidebar.get('settings:blog');
    pageData.data = retriveApplicationPropertiesFiltered(blogAppkeysArray);
    pageData.sorting = sorting;

    res.render(BASE + '/blog/index', pageData);
}

const users = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const usersAppKeysArray: AppKeysArray = [
      "allowUsernameChange",
      "allowEmailChange",
      "allowAccountDeletion",
      "storeUsernameHistory",
      "allowSelfSuspension",
      "gdprConsent",
      "automaticLogoutDuration",
      "accountLockDuration",
      "maxLoginPerHour",
      "maxPasswordResetRequests",
      "sessionExpiryDuration",
      "maxUsernameLength",
      "minUsernameLength",
      "maxFullnameLength",
      "minFullnameLength",
      "maxEmailLength",
      "minEmailLength",
      "minPasswordStrength",
      "registrationType"
    ];

    pageData.title = 'Users';
    pageData.sidebar = sidebar.get('settings:users');
    pageData.data = retriveApplicationPropertiesFiltered(usersAppKeysArray);
    pageData.registrationTypes = availableRegisterationTypes;
    pageData.passwordScores = passwordScoresWithMessage;

    res.render(BASE + '/users/index', pageData);
}

const categories = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const categoriesAppKeysArray: AppKeysArray = [
        "maxCategoryBlurbLength",
        "maxCategoryNameLength",
        "maxCategoryDescriptionLength"
    ];

    pageData.title = 'Category settings';
    pageData.sidebar = sidebar.get('settings:categories');
    pageData.data = retriveApplicationPropertiesFiltered(categoriesAppKeysArray);

    res.render(BASE + '/categories/index', pageData);
}


const posts = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const postsAppKeysArray: AppKeysArray = [
        "minPostTitleLength",
        "maxPostTitleLength",
        "minPostLength",
        "maxPostLength",
        "minTagsPerPost",
        "maxTagsPerPost",
        "maxPostThumbnailSize"
    ];

    pageData.title = 'Posts settings';
    pageData.sidebar = sidebar.get('settings:posts');
    pageData.data = retriveApplicationPropertiesFiltered(postsAppKeysArray);

    res.render(BASE + '/posts/index', pageData);
}


const uploads = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const uploadsAppKeysArray: AppKeysArray = [
        "maxFileSize",
        "maxFileSizeUnit",
        "allowedFileTypes",
        "stripFileMetadata",
        "enableFileCompression",
        "maxImageFileSize",
        "maxImageFileSizeUnit",
        "enableImageResize",
        "resizedImageHeight",
        "resizedImageWidth",
        "resizedImageQuality",
        "keepOldProfilePictures",
        "maxProfileImageSize",
        "maxProfileImageSizeUnit",
        "maxCoverImageSize",
        "maxCoverImageSizeUnit",
        "profileImageDimension",
        "maxImageWidth",
        "minImageWidth",
    ];

    pageData.title = 'File Uploads';
    pageData.sidebar = sidebar.get('settings:file-uploads');
    pageData.data = retriveApplicationPropertiesFiltered(uploadsAppKeysArray);
    pageData.fileSizeUnits = fileSizeUnits;

    res.render(BASE + '/uploads/index', pageData);
}

const emails = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};
    const emailsAppKeysArray: AppKeysArray = [
        "applicationEmail",
        "applicationEmailFromName",
        "emailService",
        "emailServiceAuthenticationType",
        "emailServiceUsername",
        "emailServicePassword",
        "emailServiceApiKey",
    ];

    pageData.title = 'Emails';
    pageData.sidebar = sidebar.get('settings:emails');
    pageData.data = retriveApplicationPropertiesFiltered(emailsAppKeysArray);
    pageData.emailServices = availableEmailServices;
    pageData.emailServiceAuthenticationTypes = emailServiceAuthenticationTypes;

    res.render(BASE + '/emails/index', pageData);
}

const notifications = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Notifications';
    pageData.sidebar = sidebar.get('settings:notifications');

    res.render(BASE + '/notifications', pageData);
}

const webAndSeo = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Web & SEO preferences';
    pageData.sidebar = sidebar.get('settings:web-and-seo');

    res.render(BASE + '/web-and-seo', pageData);
}

const cookies = async function (req: Request, res: Response, next: NextFunction) {
    const sidebar = new SideBar(sidebarData);
    const pageData: MutableObject = {};

    pageData.title = 'Cookies';
    pageData.sidebar = sidebar.get('settings:cookies');

    res.render(BASE + '/cookies', pageData);
}

function retriveApplicationPropertiesFiltered(filterKeys: AppKeysArray) {
    const applicationObject: MutableObject = {};
    const {configurationStore} = application;

    if (!configurationStore) return applicationObject;

    if (filterKeys && filterKeys.length) {
        filterKeys.forEach(key => {
            if (Object.hasOwnProperty.bind(configurationStore)(key)) {
                applicationObject[key] = configurationStore[key];
            } else {
                applicationObject[key] = null;
            }
        });
    }

    return applicationObject;
}

export default {
    site, blog, users, categories, posts, uploads, emails, notifications, webAndSeo, cookies
} as const;