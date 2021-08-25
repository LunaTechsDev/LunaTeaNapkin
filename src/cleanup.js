export default function addCleanupEvent (callback) {
  process.on('cleanup', callback);
}

process.on('exit', function () {
  process.emit('cleanup');
});

process.on('SIGINT', function () {
  process.emit('cleanup');
  process.exit(2);
});

process.on('uncaughtException', function () {
  process.emit('cleanup');
  process.exit(99);
});