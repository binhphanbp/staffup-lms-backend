require('node:events').setMaxListeners(0);

require('./auth.service.test.cjs');
require('./auth.middleware.test.cjs');
require('./rbac.middleware.test.cjs');
require('./role.service.test.cjs');
