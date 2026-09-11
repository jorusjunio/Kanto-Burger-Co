import type { useRouter } from "next/navigation";

/**
 * A gateway redirect may be our own pay page (relative) or a provider-hosted
 * checkout on another origin (absolute). router.push only handles in-app
 * routes, so absolute URLs need a full browser navigation.
 */
export function goToGateway(
  router: ReturnType<typeof useRouter>,
  url: string,
) {
  if (/^https?:\/\//.test(url)) {
    window.location.href = url;
  } else {
    router.push(url);
  }
}
