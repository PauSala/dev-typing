import React from "react";
import { SessionStats } from "../container/Container";

function StatsCard({
  name,
  value,
  color,
}: {
  name: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col rounded items-center justify-center
       items-center p-1 m-1 border border-purple-500"
    >
      <div className={"text-xs text-teal-100 p-1"}> {name}</div>
      <div className={`font-bold ${color}`}>{value}</div>
    </div>
  );
}

export default function Stats({ stats }: { stats: SessionStats }) {
  return (
    <div className="flex flex-row p-4">
      <StatsCard color="text-purple-200" name="Accuracy" value={`${stats.accuracy.toFixed(2)}%`} ></StatsCard>
      <StatsCard color="text-purple-200" name="Time" value={`${stats.time.toFixed(2)} seconds`} ></StatsCard>
      <StatsCard color="text-purple-200" name="WPM" value={`${stats.wpm.toFixed(2)}`} ></StatsCard>
    </div>
  );
}
