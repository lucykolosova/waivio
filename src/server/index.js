import http from 'http';
import app from './app';
import dotenv from 'dotenv';
dotenv.config({ path: `./env/${process.env.NODE_ENV}.env` });

const server = http.createServer(app);

let currentApp = app;

server.listen(process.env.PORT || 3000, () => console.log('SSR started'));

if (module.hot) {
  console.log('✅  Server-side HMR Enabled!');

  module.hot.accept('./app', () => {
    try {
      console.log('🔁  HMR Reloading `./app`...');
      server.removeListener('request', currentApp);
      const newApp = require('./app').default;

      server.on('request', newApp);
      currentApp = newApp;
    } catch (err) {
      console.log('HMR :: ', err);
    }
  });
  module.hot.accept();
  module.hot.dispose(() => {
    server.close();
  });
}
