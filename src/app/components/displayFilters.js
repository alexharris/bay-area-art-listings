export default function DisplayFilters({ type, presetRange, customRange, displayedResults }) {
  console.log(customRange.to);

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatPresetRange = () => {
    switch (presetRange) {
      case 'today':
        return 'Today';
      case 'thisweek':
        return 'This Week';
      case 'thismonth':
        return 'This Month';
      case 'nextmonth':
        return 'Next Month';
      default:
        return 'Custom Range';
    }
  };

  return (
    <div className="text-4xl">
      {presetRange !== 'custom' ? (
        <div className="capitalize">{type} {formatPresetRange()}</div>
      ) : formatDate(customRange.from) === formatDate(customRange.to) ? (
        <div className="capitalize">{type} {formatDate(customRange.to)}</div>
      ) : (
        <div className="capitalize">{type} {formatDate(customRange.from)} - {formatDate(customRange.to)}</div>
      )}
    </div>
  );
}
