import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function DatePicker({ onChange }) {
  const [selected, setSelected] = useState();

  useEffect(() => {
    if (selected) {
      onChange(selected);
    }
  }, [selected, onChange]);

  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={setSelected}
      showOutsideDays
    />
  );
}
