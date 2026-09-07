// LiteSpeed loads the entry with require(); load the ESM server asynchronously.
import('./server.js').then(({ startServer }) => startServer()).catch(() => {
  console.error('Server startup failed');
  process.exitCode = 1;
});
