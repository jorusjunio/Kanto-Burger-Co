/**
 * No-op today. Clearance for the fixed mobile top bar now lives on <main>
 * in the admin layout (pt-20), since the bar spans the full page width
 * rather than sitting beside any one page's header block. Kept as an
 * export so the "ADMIN / Title / subtitle" block on each admin page still
 * has a single shared hook to opt into spacing again if that changes.
 */
export const ADMIN_MOBILE_HEADER_OFFSET_CLASS = "";
