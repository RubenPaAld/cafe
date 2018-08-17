/**
 * Puerto
 **/
process.env.PORT = process.env.PORT || 3000;

/**
 * Entorno
 **/
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Semilla jwt
 **/
process.env.SEED = process.env.SEED || 'seed-local';

/**
 * Vida jwt
 */
process.env.CADUCIDAD_TOKEN = '72h';

/**
 * Mongo Database
 **/
let urlDb;

if (process.env.NODE_ENV === 'dev')
    urlDb = 'mongodb://localhost:27017/cafe';
else
    urlDb = process.env.MONGO_URI;

process.env.URL_DB = urlDb;

/**
 * Google Client ID
 */
process.env.CLIENT_ID = process.env.CLIENT_ID || '233473677259-3jsfd0t6a1b3avpult834elanb0hod2b.apps.googleusercontent.com';
