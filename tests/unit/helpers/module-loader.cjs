const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const distPath = (...segments) => path.join(ROOT, '.test-dist', ...segments);

const mockModule = (absolutePath, exportsObject) => {
  delete require.cache[absolutePath];
  require.cache[absolutePath] = {
    id: absolutePath,
    filename: absolutePath,
    loaded: true,
    exports: exportsObject,
  };
};

const loadFresh = (absolutePath) => {
  delete require.cache[absolutePath];
  return require(absolutePath);
};

const clearModule = (absolutePath) => {
  delete require.cache[absolutePath];
};

module.exports = {
  ROOT,
  distPath,
  mockModule,
  loadFresh,
  clearModule,
};
