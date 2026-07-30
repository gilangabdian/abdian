export function formatGithubLinks(container: HTMLElement) {
  if (!container) return;

  const links = container.querySelectorAll("a");
  links.forEach((link) => {
    try {
      const url = new URL(link.href);
      if (url.hostname === "github.com") {
        const pathSegments = url.pathname.split("/").filter(Boolean);

        // We only want to format user or org profiles, e.g., github.com/username
        // We ignore repos, issues, etc. (which have more than 1 path segment)
        if (pathSegments.length === 1) {
          const username = pathSegments[0];

          // Store the original text just in case, though we usually replace it
          // Or we can keep the text the user wrote, but the design usually shows the username
          const linkText = username; // Force it to show the username for consistency

          // Modify classes to look like a pill badge
          // Remove top, bottom, and left padding so the image touches the borders directly
          link.className =
            "inline-flex font-[Inter] items-center gap-2 pr-3 py-0 pl-0 rounded-full bg-neutral-200 dark:bg-neutral-800 text-sm !font-normal !text-neutral-500 dark:!text-neutral-400 !no-underline hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors mx-1 align-middle whitespace-nowrap overflow-hidden";

          // Inject the avatar image and the username text
          // The image is sized to fill the height closely
          // We use ?size=120 to ensure it is very crisp on high-DPI (Retina) displays
          link.innerHTML = `
            <img
              src="https://github.com/${username}.png?size=120"
              alt="${username}"
              class="w-6 h-6 rounded-full m-0 !my-0"
              style="display: block;"
            />
            <span class="leading-none mb-[2px]">${linkText}</span>
          `;
        }
      }
    } catch (e) {
      // Invalid URL, safely ignore
    }
  });
}
