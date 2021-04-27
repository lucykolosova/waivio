import websitesRoutes from './configs/websitesRoutes';
import routes from './configs/routes';

const switchRoutes = host => {
  if (host.includes('host')) return websitesRoutes;

  return routes;
};

export default switchRoutes;
