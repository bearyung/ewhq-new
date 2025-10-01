import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  accountId?: number;
  shopId?: number;
  identityProvider?: string;
  companies?: Array<{
    companyId: number;
    name?: string;
    role: string;
    acceptedAt?: string;
    isActive: boolean;
  }>;
}

interface Auth0ContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  loginWithRedirect: (options?: any) => void;
  loginWithSocial: (connection: string) => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasTenantAssociation: () => boolean;
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth must be used within an Auth0Provider');
  }
  return context;
};

interface Auth0ContextProviderProps {
  children: React.ReactNode;
}

export const Auth0ContextProvider: React.FC<Auth0ContextProviderProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect: auth0LoginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    user: auth0User,
  } = useAuth0();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoadAttempted, setProfileLoadAttempted] = useState(false);

  // Cache the Auth0 token for API calls
  useEffect(() => {
    const cacheAuth0Token = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          if (token) {
            // Cache the token for synchronous use in API interceptor
            localStorage.setItem('auth0_token', token);
          }
        } catch (error) {
          console.error('Error caching Auth0 token:', error);
        }
      } else {
        // Clear old tokens
        localStorage.removeItem('auth0_token');
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_info');
      }
    };

    cacheAuth0Token();
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (isAuthenticated && auth0User) {
        setProfileLoading(true);
        setProfileLoadAttempted(false);
        try {
          const token = await getAccessTokenSilently();

          // Sync user with backend
          const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5125';
          const syncResponse = await fetch(`${apiUrl}/api/auth0/sync-user`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();

            // Get full profile
            const profileResponse = await fetch(`${apiUrl}/api/auth0/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUserProfile({
                userId: profileData.userId,
                email: profileData.email,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                roles: profileData.roles || [],
                accountId: profileData.accountId,
                shopId: profileData.shopId,
                identityProvider: profileData.identityProvider,
                companies: profileData.companies || [],
              });
            }
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
          // Fallback to auth0User data when sync fails
          if (auth0User) {
            const fallbackProfile: UserProfile = {
              userId: auth0User.sub || '',
              email: auth0User.email || '',
              firstName: auth0User.given_name || auth0User.nickname || '',
              lastName: auth0User.family_name || '',
              roles: [],
              accountId: undefined,
              shopId: undefined,
              identityProvider: auth0User.sub?.split('|')[0] || '',
            };
            setUserProfile(fallbackProfile);
          }
        } finally {
          setProfileLoading(false);
          setProfileLoadAttempted(true);
        }
      } else if (!auth0Loading && !isAuthenticated) {
        // Auth0 has finished loading and user is not authenticated
        setUserProfile(null);
        setProfileLoadAttempted(true);
      }
    };

    syncUserProfile();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, auth0Loading]);

  const loginWithRedirect = (options?: any) => {
    auth0LoginWithRedirect({
      ...options,
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  const loginWithSocial = (connection: string) => {
    // Social login with specific connection
    auth0LoginWithRedirect({
      authorizationParams: {
        connection: connection,
      },
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  const logout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('auth0_token');
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_info');
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    setUserProfile(null);
  };

  const getAccessToken = async (): Promise<string> => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const isAdmin = (): boolean => {
    return userProfile?.roles?.includes('SuperAdmin') || userProfile?.roles?.includes('Admin') || false;
  };

  const hasRole = (role: string): boolean => {
    return userProfile?.roles?.includes(role) || false;
  };

  const hasTenantAssociation = (): boolean => {
    // Check if user has any tenant associations (company/brand/shop)
    return !!(
      userProfile?.accountId ||
      userProfile?.shopId ||
      (userProfile?.companies && userProfile.companies.length > 0)
    );
  };

  const value: Auth0ContextType = {
    isAuthenticated,
    // Only show loading while Auth0 is loading OR while we're authenticated and loading the profile
    // This ensures we don't prematurely show content before profile is ready
    isLoading: auth0Loading || (isAuthenticated && !profileLoadAttempted),
    user: userProfile,
    loginWithRedirect,
    loginWithSocial,
    logout,
    getAccessToken,
    isAdmin,
    hasRole,
    hasTenantAssociation,
  };

  return <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>;
};