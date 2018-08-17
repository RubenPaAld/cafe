/**
 * Puerto
 **/
process.env.PORT = process.env.PORT || 3000;

/**
 * Entorno
 **/
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Mongo Database
 **/
let urlDb;

if (process.env.NODE_ENV === 'dev')
    urlDb = 'mongodb://localhost:27017/cafe';
else
    urlDb = 'mongodb://cafe-user:ambrosio123@ds129593.mlab.com:29593/cafe';

process.env.URL_DB = urlDb;
