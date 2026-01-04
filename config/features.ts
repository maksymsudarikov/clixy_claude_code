/**
 * Feature flags per tenant
 * Controlled by VITE_TENANT environment variable
 *
 * This allows us to toggle features on/off based on which tenant is being built.
 * Build with VITE_TENANT=olga for full features, or VITE_TENANT=generic for demo version.
 */

export interface FeatureFlags {
  // Olga-specific features
  giftCards: boolean;
  packageCatalog: boolean;
  tallyForms: boolean;

  // Notification system
  notifications: boolean; // Email notifications for status changes

  // Future features
  analytics: boolean;
  multiPhotographer: boolean;
}

const featuresByTenant: Record<string, FeatureFlags> = {
  olga: {
    giftCards: true,
    packageCatalog: true,
    tallyForms: true,
    notifications: false,    // Phase 2: Foundation ready, disabled for production safety
    analytics: false,
    multiPhotographer: false,
  },
  generic: {
    giftCards: false,        // Hide for generic demo
    packageCatalog: false,   // Hide for generic demo
    tallyForms: false,       // Hide for generic demo (show generic contact)
    notifications: false,    // Phase 2: Console logging only
    analytics: false,
    multiPhotographer: false,
  },
};

// Get tenant from environment variable (build-time)
const getTenantId = (): string => {
  return import.meta.env.VITE_TENANT || 'olga';
};

// Export features for current tenant
export const FEATURES: FeatureFlags = featuresByTenant[getTenantId()];

// Helper to check if feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURES[feature];
};

// Export tenant ID for debugging
export const CURRENT_TENANT = getTenantId();
