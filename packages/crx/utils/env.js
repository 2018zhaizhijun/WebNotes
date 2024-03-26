// tiny wrapper with default env vars
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DEV_HOST: 'https://localhost:4000/',
  PROD_HOST: '',
};
