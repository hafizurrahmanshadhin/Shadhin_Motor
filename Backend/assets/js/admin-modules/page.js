// Legacy compatibility entry. New admin pages should load their page-specific
// entrypoint directly so Blade modules stay isolated.
import "../frontend-content/page.js";
import "../media/page.js";
import "../reviews/page.js";
import "../roles/page.js";
import "../users/page.js";
