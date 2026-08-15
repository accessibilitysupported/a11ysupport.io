/**
 * T045: port of bin/www. `npm start` boots this single process serving `dist/` + `/api`
 * (FR-010/SC-006) — no change to the operational contract versus today.
 */
import http from 'node:http';
import { createApp } from './app';

function normalizePort(val: string | undefined): number | string | false {
  const port = parseInt(val ?? '3000', 10);

  if (isNaN(port)) {
    return val ?? false; // named pipe
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

const port = normalizePort(process.env.PORT);
const app = createApp();
app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  console.log('Listening on ' + bind);
});
