const SCALAR_SPEC_URL = '/api/v1/openapi.json';

const scalarConfig = {
  url: SCALAR_SPEC_URL,
  layout: 'modern',
  theme: 'bluePlanet',
  persistAuth: true,
  showDeveloperTools: 'localhost',
  metaData: {
    title: 'Staffup LMS API Docs',
    description: 'Interactive API reference for the Staffup LMS backend.',
  },
};

const serializedConfig = JSON.stringify(scalarConfig).replace(/</g, '\\u003c');

export const scalarHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Staffup LMS API Docs</title>
    <style>
      html, body, #app {
        margin: 0;
        width: 100%;
        height: 100%;
      }

      body {
        background: #f5f8ff;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', ${serializedConfig})
    </script>
  </body>
</html>
`;

export const scalarCsp =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.scalar.com; " +
  "img-src 'self' data: https:; " +
  "font-src 'self' data: https://fonts.scalar.com; " +
  "connect-src 'self' https:; " +
  "worker-src 'self' blob:;";
