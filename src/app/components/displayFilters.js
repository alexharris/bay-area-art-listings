export default function DisplayFilters({ type, presetRange, customRange, displayedResults, selectedCounty }) {

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatType = () => {
    switch (type) {
      case 'onview':
        return 'all exhibitions';
      case 'opening':
        return 'upcoming exhibitions';
      case 'closing':
        return 'closing exhibitions';
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
      case 'anytime':
        return 'anytime';
      default:
        return 'anytime';
    }
  };

  const formatSelectedCounty = () => {
    switch (selectedCounty[0]?.county) {
      default:
        return 'anywhere';
    }
  };

  return (
    <div className="normal-case leading-1">
      Showing&nbsp;
      {presetRange !== 'custom' ? (
        <>{formatType(type)} {formatPresetRange()}</>
      ) : formatDate(customRange.from) === formatDate(customRange.to) ? (
        <>{formatType(type)} {formatDate(customRange.to)}</>
      ) : (
        <>{formatType(type)} {formatDate(customRange.from)} - {formatDate(customRange.to)}</>
      )} 
      {selectedCounty[0] ? (
          <> in {selectedCounty[0].county} county</>
        ) : (
          <> {formatSelectedCounty()}</>
        )}
        
    </div>
  );
}
