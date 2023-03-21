import {connect} from './connection';
import { initializeSessionStore } from './database';

export const database: {client?: any, connection?: any, sessionStore?: any} = {};

export const initializeDbConnection = async function (mongodb: any) {
    if (!Object.keys(mongodb).length) {
        throw new Error('Database configuration could not be loaded');
    }

    const {uri, db} = mongodb;
    if (!uri) {
        throw new Error('Database connection uri not found in the configuration');
    }

    if (!db) {
        throw new Error('Target database name is required for connection');
    }

    var dbCredentials = uri.match(/(?<=:\/\/)(.*)(?=@)/gi);
    if (!dbCredentials?.length || dbCredentials.length < 1) {
        console.warn('username and password missing from the connection URI');
    }

    const {client, connection, dbName} = await connect(uri, {database: db}); 
    const sessionStore = await initializeSessionStore(connection, dbName);

    database.client = client;
    database.connection = connection;
    database.sessionStore = sessionStore;
}

export const closeConnection = async function (callback?: Function) {
    if (!callback) {
        callback = function (err: Error) {
            console.error(err.message);
        }
    }

    if (!database.connection) {
        throw new Error('Cannot close connection as it does not exists');
    }

    try {
        database.connection.close();
    } catch (err) {
        callback(err);
    }
}