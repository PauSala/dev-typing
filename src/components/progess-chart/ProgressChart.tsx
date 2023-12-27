import { LineChart, Line, Tooltip, Legend } from "recharts";
import { GlobalStats } from "../container/Container";

export default function ProgressChart({ data, width }: { data: GlobalStats, width: number }) {
  let maxAcc = -Infinity;
  let minAcc = Infinity;
  let maxWpm = -Infinity;
  let minWmp = Infinity;

  data.forEach((e) => {
    if (e.accuracy > maxAcc) {
      maxAcc = e.accuracy;
    }
    if (e.accuracy < minAcc) {
      minAcc = e.accuracy;
    }
    if (e.wpm > maxWpm) {
      maxWpm = e.wpm;
    }
    if (e.wpm < minWmp) {
      minWmp = e.wpm;
    }
  });
  const normalized = [...data].map((e) => {
    e.accuracy = ((e.accuracy - minAcc) / (maxAcc - minAcc)) * 100;
    e.wpm = ((e.wpm - minWmp) / (maxWpm - minWmp)) * 100;
    return e;
  });

  return (
    <LineChart
      width={width}
      height={150}
      data={normalized}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <Legend />
      <Line type="monotone" dataKey="accuracy" stroke="#c084fc" dot={false} />
      <Line type="monotone" dataKey="wpm" stroke="#a7f3d0" dot={false} />
    </LineChart>
  );
}
