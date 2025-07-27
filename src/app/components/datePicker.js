import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function DatePicker({ onChange }) {
  const [selected, setSelected] = useState();
  console.log('hello from DatePicker, selected:', selected);
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
