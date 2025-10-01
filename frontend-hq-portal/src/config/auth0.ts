export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'everyware.au.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-client-id',
  redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin + '/callback',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://api.posx.one',
  scope: 'openid profile email',
};