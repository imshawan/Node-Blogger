import url from 'url';
import { Request, Response, NextFunction } from 'express';
import { capitalizeFirstLetter } from '@src/utilities';
import { log } from 'console';

const ICONS = {
    home: 'fa-home',
}

export const breadcrumbs = function (req: Request, res: Response, next: NextFunction) {

    var requestUri: string = String(req.url);
    if (!requestUri) {
        requestUri = '/';
    }

    // grab the current url
    const baseUrl = url.format({
        protocol: req.protocol,
        host: req.get('host')
    });

    // break it apart removing empty string
    var parts: Array<string> = [];
    const urlWithStringQuery = url.parse(requestUri);

    if (urlWithStringQuery && urlWithStringQuery.hasOwnProperty('pathname')) {
        let partsArray = urlWithStringQuery.pathname?.split('/').filter(Boolean);
        if (partsArray && partsArray.length) {
            parts = partsArray;
        }
    }

    // array to store items
    const items = [];

    // insert home link
    items.push({
        label: 'Home',
        url: baseUrl,
        active: parts.length < 1,
        icon: ICONS['home'],
    });

    // go through each item and add a breadcrumb object to the items array
    for (var i = 0, l = parts.length; i < l; i++) {

        // create breadcrumb item
        let label = parts[i].replace(/-/g, ' ');
        items.push({
            label: label && capitalizeFirstLetter(label),
            url: url.resolve(baseUrl, parts.slice(0, i + 1).join('/')),
            active: i === (parts.length - 1),
            // @ts-ignore
            icon: ICONS[label],
        });
    }

    // make the breadcrumbs available to express views (only in current request)
    res.locals.breadcrumb = items;

    next();
};