const AUTHENTICATED_ROOTS = new Set(['MainNavigation', 'DeliveryNavigation']);

export const isAuthenticatedNavigation = (routeNames: string[]): boolean =>
  routeNames.some((routeName) => AUTHENTICATED_ROOTS.has(routeName));
