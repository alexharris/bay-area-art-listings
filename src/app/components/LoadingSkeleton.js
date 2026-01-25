/**
 * Loading skeleton component for better UX during data fetching
 */
export default function LoadingSkeleton({ count = 3 }) {
    return (
        <div className="w-full px-3 md:p-2 lg:p-0" role="status" aria-label="Loading exhibitions">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="border-b border-dashed border-gray-400 pt-5 pb-6 w-full flex flex-col md:flex-row justify-between gap-4 animate-pulse"
                >
                    {/* Left column skeleton */}
                    <div className="flex flex-col lg:flex-row lg:gap-4 w-full lg:w-2/3">
                        {/* Image skeleton */}
                        <div className="flex-shrink-0 mb-3 lg:mb-0">
                            <div className="w-full h-40 lg:w-36 lg:h-36 bg-gray-200 rounded" />
                        </div>
                        {/* Text skeleton */}
                        <div className="flex flex-col flex-1 gap-2">
                            <div className="h-8 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                    </div>

                    {/* Right column skeleton */}
                    <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-4 w-full lg:w-1/2">
                        {/* Date skeleton */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="h-5 bg-gray-200 rounded w-40" />
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </div>
                        {/* Location skeleton */}
                        <div className="w-full">
                            <div className="bg-gray-100 rounded p-4 h-full">
                                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <span className="sr-only">Loading...</span>
        </div>
    );
}
