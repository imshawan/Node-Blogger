import crypto from 'crypto';
import axios from 'axios';
import _ from 'lodash';
import { MutableObject, IMongoConnectionProps, TimeUnitSuffix } from '@src/types';
import { execSync } from 'child_process';
import { Request } from 'express';
import {createCanvas, registerFont} from 'canvas';
import path from 'path';

export * from './password';
export * from './slugify';
export * from './logger';
export * from './mimetypes';
export * from './sidebar';
export * from './sessionstore';
export * from './changelog';
export * from './url';

export const getISOTimestamp = () => new Date().toISOString();

export const ipV4Regex = /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

export const generateUUID = () => { 
    return crypto.randomUUID();
}

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const resolveIpAddrFromHeaders = function (req: Request) {
    const headersToLookFor = [
        'x-client-ip',
        'x-forwarded-for',
        'cf-connecting-ip',
        'do-connecting-ip',
        'fastly-client-ip',
        'true-client-ip',
        'x-real-ip',
        'x-cluster-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
        'x-appengine-user-ip'
    ];
    const headers = req.headers;

    const getClientIpFromXForwardedHeader = (header: string | string[]) => {
        if (!header) {
            return null;
        }

        if (Array.isArray(header)) {
            header = header.join(',');
        }
    
        const ips = header.split(',').filter(ip => ipV4Regex.test(ip));
        const clientIp = ips[0].trim();
        return clientIp;
    }

    if (headers['x-forwarded-for']) {
        let headerValue = getClientIpFromXForwardedHeader(headers['x-forwarded-for']);
        if (headerValue) return headerValue;
    }

    let value: string | string[] | undefined = '';
    for (const element of headersToLookFor) {
        if (headers[element]) {
            value = headers[element];
            break;
        }
    }

    if (Array.isArray(value) && value.length) {
        value = String(value[0]).trim();
    }

    if (ipV4Regex.test(String(value))) {
        return String(value).trim();
    } else {
        return null;
    }
}

export const resolveIpFromRequest = function (req: Request) {
    let ip: string | null = req.ip;
    if (ipV4Regex.test(ip)) {
        return String(ip).trim();
    }

    let ips = ip.split(':').find(e => ipV4Regex.test(e));
    if (ips) {
        return ips
    } else return null;
}

export const resolveGeoLocation = async (ipAddr: string): Promise<{[key: string]: any;}> => {
    const ipLookupUrl = 'http://ip-api.com/json/';
    const response: any = await axios.get(`${ipLookupUrl}${ipAddr}`);
    const geoLocation = {
        city: 'Unknown',
        country: 'Unknown',
        countryCode: '',
    };

    if (response.data && Object.keys(response.data).length) {
        
        if (Object.hasOwnProperty.bind(response.data)('city')) {
            geoLocation.city = response.data.city;
        }
        if (Object.hasOwnProperty.bind(response.data)('country')) {
            geoLocation.country = response.data.country;
        }
        if (Object.hasOwnProperty.bind(response.data)('countryCode')) {
            geoLocation.country = response.data.country;
        }
    }

    return geoLocation;
}

export const parseBoolean = function(value: any) {
    if (!value) return false;

    if (Array.isArray(value)) {
        return Boolean(value.length);
    }
    if (typeof value == 'object') {
        return Boolean(Object.keys(value).length);
    }

    try {
        value = JSON.parse(String(value).toLowerCase().trim());
    } catch (err) {
        value = false;
    }

    return value;
}

export const isParsableJSON = function (jsonString?: string) {
    if (!jsonString) return false;
    
    try {
        JSON.parse(jsonString);
        return true;
    } catch (err) {
        return false;
    }
}

export const filterObjectByKeys = function (obj: MutableObject, keys: string[]) {
    if (!Object.keys(obj).length) return obj;
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([key]) => keys.includes(key))
    );
}

export const getArgv = function (key: string): string | Number | Boolean {
    const args = process.argv;
    const parsedArgs: MutableObject = {};
    
    // Start from index 2 to skip "node" and the script name
    for (let i = 2; i < args.length; i++) { 
        const arg = args[i];

        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            parsedArgs[key] = value || true;
        }
    }

    const value = parsedArgs[key];
    if (value) {
        if (!isNaN(value)) return Number(value);
        return value;
    } else return '';
}

export const validateMongoConnectionUrl = function (url: string): IMongoConnectionProps | null {
    const regex = /^(mongodb\+srv:\/\/)(.*?):(.*?)@(.*?)\/?$/;
    const match = url.match(regex);

    if (match && match.length === 5) {
        const [, protocol, username, password, clusterAddress] = match;
        return {
            protocol,
            username,
            password,
            clusterAddress
        };
    } else {
        return null;
    }
}

export const sanitizeHtml = function (inputHtml: string, unsafeTags = ['script', 'iframe']) {
    const tagRegex = new RegExp(`<(${unsafeTags.join('|')})\\b[^<]*(?:(?!<\\/\\1>)<[^<]*)*<\\/\\1>`, 'gi');
    const safeHtml = inputHtml.replace(tagRegex, '');

    const sanitizedHtml = safeHtml.replace(/on\w+="[^"]*"/gi, '');
  
    // Remove attributes that may contain JavaScript code
    const attributeRegex = /(?:\s|^)(on\w+|href|src)\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/gi;
    const finalSanitizedHtml = sanitizedHtml.replace(
      attributeRegex,
      (match, attributeName, attributeValue) => {
        if (
          attributeName.toLowerCase() === "on" ||
          attributeValue.toLowerCase().includes("javascript:")
        ) {
          return "";
        } else {
          return match;
        }
      }
    );
  
    return finalSanitizedHtml;
  }

export const isGraphicalEnvironmentAvailable = (): boolean => {
    return !!(process.env.DISPLAY && process.env.XDG_SESSION_TYPE);
}

export const openWebUrl = (url: string) => {
    if (!isGraphicalEnvironmentAvailable()) {
        return;
    }

    const command = process.platform === 'darwin' ? `open ${url}` : 
        process.platform === 'win32' ? `start ${url}` : `xdg-open ${url}`;

    execSync(command);
}

export const calculateReadTime = function (content: string, suffix: TimeUnitSuffix) {
    const averageWordsPerMinute = 185;
    const wordCount = String(content).split(' ').length;

    if (!wordCount) return 0;

    const readTimeInMinutes = wordCount / averageWordsPerMinute;

    let readTime: number = 0;
    switch (suffix) {
        case 'ms':
        case 'msec':
            readTime = readTimeInMinutes * 60 * 1000; // Convert minutes to milliseconds
            break;

        case 'milli':
        case 'millisecond':
            readTime = readTimeInMinutes * 60 * 1000; // Convert minutes to milliseconds
            break;

        case 'sec':
        case 'second':
            readTime = readTimeInMinutes * 60; // Convert minutes to seconds
            break;

        case 'min':
        case 'minute':
            readTime = readTimeInMinutes;
            break;

        default:
            readTime = readTimeInMinutes;
            break;
    }

    const roundedReadTime = Math.ceil(readTime);
    return roundedReadTime;
}

export const textFromHTML = function (html: string) {
    if (!html) return '';
    return html
        .replace(/\n/ig, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style[^>]*>/ig, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head[^>]*>/ig, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/ig, '')
        .replace(/<\/\s*(?:p|div)>/ig, '\n')
        .replace(/<br[^>]*\/?>/ig, '\n')
        .replace(/<[^>]*>/ig, '')
        .replace('&nbsp;', ' ')
        .replace(/[^\S\r\n][^\S\r\n]+/ig, ' ');
}

export const clipContent = function (content: string, wordLimit: number) {
    if (!content || !content.length) return '';

    const match = content.match(new RegExp(`^(\\S+\\s*){1,${wordLimit}}`));
    return match ? match[0] : content;
}

export const abbreviateNumber = function (num: number) {
    if (num < 1000) {
		return num.toString();
	} else if (num < 1000000) {
		return (num / 1000).toFixed(1) + "K";
	} else if (num < 1000000000) {
		return (num / 1000000).toFixed(1) + "M";
	} else if (num < 1000000000000) {
		return (num / 1000000000).toFixed(1) + "B";
	} else {
		return (num / 1000000000000).toFixed(1) + "T";
	}
}

export const generateAvatarFromInitials = function (name: string, size: number = 200) {
    const colours = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#95a5a6",
        "#f39c12",
        "#d35400",
        "#c0392b",
        "#bdc3c7",
        "#7f8c8d",
      ];

    const canvas = createCanvas(size, size);
    const context = canvas.getContext('2d');

    const nameSplit = name.split(" ");
    let initials = nameSplit[0].charAt(0).toUpperCase();
        if (nameSplit.length > 1) {
            initials += nameSplit[1].charAt(0).toUpperCase();
        }

        const charIndex = initials.charCodeAt(0) - 65,
            colourIndex = charIndex % 19;

    context.fillStyle = colours[colourIndex];;
    context.fillRect(0, 0, size, size);

    context.fillStyle = '#fff';
    context.font = `${Math.floor(size / 2)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(initials, size / 2, size / 2);

    const base64 = canvas.toDataURL('image/png')

    return base64;
}

export const excapeRegExp = function (content: string) {
    if (!content || !content.length) return content;
    return content.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const sanitizeString = function (str: string, replaceWith: string = '-') {
    return str.replace(':', replaceWith)
}

export const resolveFilename = (context: string, removeExt: boolean = true) => {
    let filename = path.basename(context);
    if (removeExt) {
        return filename.split('.').shift();
    }

    return filename;
}