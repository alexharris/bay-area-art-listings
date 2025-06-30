export default function DisplayFilters({ type, presetRange, customRange, displayedResults, selectedCounty }) {

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatType = () => {
    switch (type) {
      case 'onview':
        return 'On view';
      case 'opening':
        return 'Opening';
      case 'closing':
        return 'Closing';
      default:
        return type
    } 
  };

  const formatPresetRange = () => {
    switch (presetRange) {
      case 'today':
        return 'today';
      case 'thisweek':
        return 'this week';
      case 'thismonth':
        return 'this month';
      case 'nextmonth':
        return 'next month';
      default:
        return 'Custom Range';
    }
  };

  return (
    <div className="normal-case leading-1 pr-4">
      {presetRange !== 'custom' ? (
        <>{formatType(type)} {formatPresetRange()}</>
      ) : formatDate(customRange.from) === formatDate(customRange.to) ? (
        <>{formatType(type)} {formatDate(customRange.to)}</>
      ) : (
        <>{formatType(type)} {formatDate(customRange.from)} - {formatDate(customRange.to)}</>
      )} 
      {selectedCounty[0] && (
          <> in {selectedCounty[0].county} county</>
        )}
        
    </div>
  );
}
