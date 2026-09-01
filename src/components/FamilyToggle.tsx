export function FamilyToggle({
  isFamily,
  onToggle,
  disabled,
}: {
  isFamily: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const color = isFamily ? "#3B82F6" : "#F97316";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-label="Toggle family or personal"
      aria-pressed={isFamily}
      title={isFamily ? "Family expense — tap to mark personal" : "Personal expense — tap to mark family"}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50"
      style={{ background: color }}
    >
      <span
        className={`absolute inset-y-0 left-[3px] flex items-center text-[9px] font-bold text-white transition-opacity ${
          isFamily ? "opacity-100" : "opacity-0"
        }`}
      >
        F
      </span>
      <span
        className={`absolute inset-y-0 right-[3px] flex items-center text-[9px] font-bold text-white transition-opacity ${
          isFamily ? "opacity-0" : "opacity-100"
        }`}
      >
        P
      </span>
      <span
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
        style={{
          transform: isFamily ? "translateX(16px)" : "translateX(0px)",
          boxShadow: `0 0 0 2px ${color}4D`,
        }}
      />
    </button>
  );
}
