export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  let colorClass = "";
  
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      colorClass = "bg-green-500/10 text-green-400 border-green-500/20";
      break;
    case 'MEDIUM':
      colorClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      break;
    case 'HARD':
      colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
      break;
    case 'EXPERT':
      colorClass = "bg-red-500/10 text-red-400 border-red-500/20";
      break;
    default:
      colorClass = "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${colorClass}`}>
      {difficulty}
    </span>
  );
}
