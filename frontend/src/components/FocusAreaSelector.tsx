import { FOCUS_AREAS } from "../types";

interface Props {
  selected: string[];
  onChange: (areas: string[]) => void;
}

export function FocusAreaSelector({ selected, onChange }: Props) {
  function toggle(area: string) {
    onChange(
      selected.includes(area)
        ? selected.filter((a) => a !== area)
        : [...selected, area]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FOCUS_AREAS.map((area) => {
        const active = selected.includes(area);
        return (
          <button
            key={area}
            type="button"
            onClick={() => toggle(area)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {area}
          </button>
        );
      })}
    </div>
  );
}
