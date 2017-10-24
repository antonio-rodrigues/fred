// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// serverUrl: 'https://466979d1.ngrok.io',

export const environment = {
  fixtures: false,
  production: false,
  version: 'dev-0.0.1',
  serverUrl: 'http://localhost:8080',
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'fr-FR'
  ],
  country: 'United Kingdom',
  company: 'British Airways'
};
