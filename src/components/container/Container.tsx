import { useEffect, useRef, useState } from "react";
import { Editor } from "../Editor";
import Stats from "../stats/Stats";
import ProgressChart from "../progess-chart/ProgressChart";

export interface SessionStats {
  day: string;
  accuracy: number;
  wpm: number;
  time: number;
}
export type GlobalStats = { accuracy: number; wpm: number }[];

const buildStats = (
  seconds: number,
  errors: number,
  correct: number
): SessionStats => {
  const averageWordSize = 4.7;
  const totalChars = correct + errors;
  const words = totalChars / averageWordSize;
  const minutes = seconds / 60;
  return {
    accuracy: (correct / totalChars) * 100,
    day: new Date().toISOString(),
    wpm: words / minutes,
    time: seconds,
  };
};

export default function Container() {
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrect] = useState(0);
  const [start, setStart] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [model, setCurrentModel] = useState(
    ["fn sum(a: i32, b: i32) -> i32 {", "\ta + b", "}"].join("\n")
  );
  const [lang, setLang] = useState("rust");
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Use getBoundingClientRect to get the width of the element
    const elementWidth = containerRef.current?.getBoundingClientRect().width;
    setContainerWidth(elementWidth || 200);
    console.log("Element width:", elementWidth);
  }, []);

  useEffect(() => {
    setGlobalStats(() => {
      const s = localStorage.getItem("devTyping");
      if (s) {
        const data = JSON.parse(s);
        return Object.entries(data).map(([_, value]) => {
          return {
            accuracy: (value as any).accuracy,
            wpm: (value as any).wpm,
          };
        });
      }
      return [];
    });
  }, []);

  const startHandler = () => {
    setStart(true);
    setErrors(0);
    setCorrect(0);
    setStartTime(Date.now());
  };
  const endHandler = () => {
    setStart((_) => false);
    setEndTime(() => Date.now());
  };

  const errorHandler = () => {
    setErrors((prev) => prev + 1);
  };
  const correctHandler = () => {
    setCorrect((prev) => prev + 1);
  };
  useEffect(() => {
    setStats(buildStats((endTime - startTime) / 1000, errors, correctChars));
  }, [correctChars, errors, startTime, endTime]);

  const saveSession = () => {
    const s = localStorage.getItem("devTyping");
    if (s) {
      const sessions = JSON.parse(s);
      sessions[stats?.day as string] = stats;
      localStorage.setItem("devTyping", JSON.stringify(sessions));
    } else {
      const sessions: { [k: string]: SessionStats } = {};
      sessions[stats?.day as string] = stats as SessionStats;
      localStorage.setItem("devTyping", JSON.stringify(sessions));
    }
    setGlobalStats(() => {
      const s = localStorage.getItem("devTyping");
      if (s) {
        const data = JSON.parse(s);
        return Object.entries(data).map(([_, value]) => {
          return {
            accuracy: (value as any).accuracy,
            wpm: (value as any).wpm,
          };
        });
      }
      return [];
    });
  };

  return (
    <div className="font-mono text-emerald-200">
      <div className="flex items-center justify-start">
        <h1 className="text-xl text-purple-200 p-2 ml-3 w-[39vw]">
          Welcome to DevTyping{" "}
        </h1>
        <div>
          <label htmlFor="cars">Language: </label>
          <select
            className="rounded text-purple-950 p-1 w-40"
            name="cars"
            id="cars"
            onChange={(v) => {
              setShow(false);
              setTimeout(() => {
                setLang(v.target.value);
                setShow(true);
              }, 500);
            }}
          >
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="javascript">Javascript</option>
            <option value="rust" selected={true}>
              Rust
            </option>
            <option value="typescript">Typescript</option>
          </select>
        </div>
      </div>
      <div className="h-[90vh] flex justify-evenly">
        <div
          className="flex flex-col justify-items-stretch w-[38vw] p-2 bg-zinc-800 flex flex-col"
          ref={containerRef}
        >
          <div>
            <h4 className="text-purple-400">Instructions</h4>
          </div>
          <div className="text-sm">
            <p>
              Paste your code in the editor (right click menu) and start typing when you are ready.
            </p>
            
          </div>
          <div className="text-sm">
            <p> Good luck!</p>
          </div>

          {!start && stats && <Stats stats={stats}></Stats>}
          {!start && stats && (
            <div className="flex flex-row justify-center">
              <button
                className="transition-opacity opacity-50 hover:opacity-100 m-2 border border-emmerald-300 rounded p-2 w-40"
                onClick={() => saveSession()}
              >
                Save session
              </button>
              <button
                disabled={!model}
                className="transition-opacity opacity-50 hover:opacity-100 m-2 border border-emmerald-300 rounded p-2 w-40"
                onClick={() => {
                  setShow(false);
                  setTimeout(() => setShow(true), 500);
                }}
              >
                Retry
              </button>
              <button
                className="transition-opacity opacity-50 hover:opacity-100 m-2 border border-emmerald-300 rounded p-2 w-40"
                onClick={() => {
                  setShow(false);
                  setTimeout(() => {
                    setCurrentModel("");
                    setShow(true);
                  }, 500);
                }}
              >
                New
              </button>
            </div>
          )}
          <br />
          {globalStats.length > 2 && (
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-purple-400">Global progress </p>
              </div>
              <ProgressChart
                data={globalStats || []}
                width={containerWidth}
              ></ProgressChart>
            </div>
          )}
        </div>
        {(show && (
          <Editor
            errorHandler={errorHandler}
            correctHandler={correctHandler}
            startHandler={startHandler}
            endHandler={endHandler}
            saveCurrentModelHandler={(model: string) => setCurrentModel(model)}
            model={model}
            lang={lang}
          />
        )) || (
          <div className="flex flex-col justify-items-stretch w-[60vw] p-2 bg-[#1e1e1e] flex flex-col text-sm">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
