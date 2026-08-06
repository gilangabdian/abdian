export function formatGithubLinks(container: HTMLElement) {
  if (!container) return;

  const links = container.querySelectorAll("a");
  links.forEach((link) => {
    try {
      const url = new URL(link.href);
      if (url.hostname === "github.com") {
        const pathSegments = url.pathname.split("/").filter(Boolean);

        // We want to handle either github.com/username (1 segment)
        // or github.com/username/repo (2 segments)
        if (pathSegments.length === 1 || pathSegments.length === 2) {
          const username = pathSegments[0];
          const repo = pathSegments.length === 2 ? pathSegments[1] : null;

          // If it's a repo link, we show the repo name, otherwise the username
          const linkText = repo ? repo : username;

          let avatarUrl = `https://github.com/${username}.png?size=120`;
          let isCustomIcon = false;

          // Check if user provided a custom icon hash (e.g. #icon-typescript)
          if (url.hash && url.hash.startsWith("#icon-")) {
            const iconParam = url.hash.replace("#icon-", "");
            let prefix = "skill-icons"; // default prefix for beautiful tech logos
            let name = iconParam;

            if (iconParam.includes(":")) {
              const parts = iconParam.split(":");
              prefix = parts[0];
              name = parts[1];
            }

            avatarUrl = `https://api.iconify.design/${prefix}/${name}.svg`;
            isCustomIcon = true;
          }

          // Modify classes to look like a pill badge
          link.className =
            "inline-flex font-[Inter] items-center gap-2 pr-3 py-0 pl-0 rounded-full bg-neutral-200 dark:bg-neutral-900 text-sm !font-semibold !text-neutral-500 dark:!text-neutral-500 !no-underline hover:bg-neutral-300 dark:hover:bg-neutral-800 transition-colors mx-1 align-middle whitespace-nowrap overflow-hidden";

          link.innerHTML = `
            <img
              src="${avatarUrl}"
              alt="${linkText}"
              class="w-6 h-6 m-0 !my-0 ${isCustomIcon ? "rounded-md p-[2px]" : "rounded-full"}"
              style="display: block; ${isCustomIcon ? "object-fit: contain;" : ""}"
            />
            <span class="leading-none mb-[2px]">${linkText}</span>
          `;

          // Remove the hash from the actual href so the browser doesn't try to scroll to a non-existent element when clicked
          if (url.hash) {
            const cleanUrl = new URL(link.href);
            cleanUrl.hash = "";
            link.href = cleanUrl.toString();
          }
        }
      }
    } catch (e) {
      // Invalid URL, safely ignore
    }
  });
}
