"use client";
import { ChangeEvent, ReactElement, useCallback } from "react";
import { useCroct, useEvaluation } from "@croct/plug-react";
import "./style.css";

type Persona = "marketer" | "developer" | "growth-hacker" | "default";

type PersonaSelectorProps = {
  cacheKey?: string;
};

export default function PersonaSelector({
  cacheKey,
}: PersonaSelectorProps): ReactElement {
  const croct = useCroct();
  const persona = useEvaluation<Persona | null>(
    "user's persona or else 'default'",
    {
      cacheKey: cacheKey,
      initial: null,
      fallback: "default",
    }
  );

  const setPersona = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const patch = croct.user.edit();

      if (event.target.value === "default") {
        patch.unset("custom.persona");
      } else {
        patch.set("custom.persona", event.target.value);
      }

      patch
        .save()
        .then(() => window.setTimeout(() => window.location.reload(), 300));
    },
    [croct]
  );

  return (
    <div className="persona-selector">
      {persona && (
        <div className="select">
          <select defaultValue={persona} onChange={setPersona}>
            <option value="default">👤 Default</option>
            <option value="marketer">👩‍💻 Marketer</option>
            <option value="growth-hacker">🚀 Growth Hacker</option>
            <option value="developer">🦸‍♂ Developer</option>
          </select>
          <svg
            viewBox="0 0 8 6"
            width="8"
            height="6"
            fill="none"
            className="icon-arrow"
          >
            <path
              d="M7 1.5l-3 3-3-3"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
