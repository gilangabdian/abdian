import "iconify-icon";

interface PhotoControlsProps {
  isSquareGrid: boolean;
  onToggle: (value: boolean) => void;
}

export default function PhotoControls({ isSquareGrid, onToggle }: PhotoControlsProps) {
  return (
    <div
      className="fixed top-20 md:left-5 md:top-24 z-40 flex justify-start mb-6 controls-container transition-opacity duration-300"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <button
        onClick={() => onToggle(!isSquareGrid)}
        className="flex items-center justify-center p-2 text-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/10 rounded-md cursor-pointer focus:outline-none transition-colors"
        title="Switch View"
      >
        <iconify-icon          icon={isSquareGrid ? "mdi:grid" : "ri:layout-masonry-line"}
          className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        ></iconify-icon>
      </button>
    </div>
  );
}
