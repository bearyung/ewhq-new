import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from '../config/auth0';

interface Auth0ProviderWithHistoryProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithHistoryProps> = ({ children }) => {

  const onRedirectCallback = (appState?: any) => {
    // Use the returnTo from appState, otherwise stay on current path
    const returnTo = appState?.returnTo || window.location.pathname;

    // Remove any Auth0 params from URL
    window.history.replaceState({}, document.title, returnTo);
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope,
        // Add social connection hints for social logins
        connection: undefined, // Will be set dynamically when using social login
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={false}
    >
      {children}
    </Auth0Provider>
  );
};