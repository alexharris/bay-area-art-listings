'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';

const chartConfig = {
  count: {
    label: "Shows",
    color: "hsl(var(--chart-1))",
  },
};

export default function DashboardClient({ stats }) {
  const [selectedYear, setSelectedYear] = useState(stats.availableYears?.[0] || new Date().getFullYear().toString());

  // Calculate max openings across all years for consistent scale
  const maxOpenings = Math.max(
    ...Object.values(stats.openingsData || {}).flatMap(yearData => 
      yearData.map(d => d.count)
    )
  );

  const handlePreviousYear = () => {
    const currentIndex = stats.availableYears.indexOf(selectedYear);
    if (currentIndex < stats.availableYears.length - 1) {
      setSelectedYear(stats.availableYears[currentIndex + 1]);
    }
  };

  const handleNextYear = () => {
    const currentIndex = stats.availableYears.indexOf(selectedYear);
    if (currentIndex > 0) {
      setSelectedYear(stats.availableYears[currentIndex - 1]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShows}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shows</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeShows}</div>
            <p className="text-xs text-muted-foreground">Current & upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-xs text-muted-foreground">Unique venues</p>
          </CardContent>
        </Card>
      </div>

      {/* Show Openings Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Show Openings per Day</CardTitle>
              <CardDescription>Daily opening distribution for {selectedYear}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousYear}
                disabled={stats.availableYears.indexOf(selectedYear) === stats.availableYears.length - 1}
                className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">{selectedYear}</span>
              <button
                onClick={handleNextYear}
                disabled={stats.availableYears.indexOf(selectedYear) === 0}
                className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.openingsData[selectedYear] || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
                  ticks={[1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]}
                  tickFormatter={(day) => {
                    const date = new Date(parseInt(selectedYear), 0, day);
                    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
                    return monthShort.substring(0, 2);
                  }}
                />
                <YAxis 
                  domain={[0, maxOpenings]}
                  label={{ value: 'Number of Openings', angle: -90, position: 'insideLeft', style: { fontSize: 12, textAnchor: 'middle' } }}
                />
                <Tooltip 
                  labelFormatter={(day) => {
                    const date = new Date(parseInt(selectedYear), 0, day);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--color-count)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Shows per County Table */}
        <Card>
          <CardHeader>
            <CardTitle>Shows per County</CardTitle>
            <CardDescription>Distribution across Bay Area counties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      County
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Shows
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {stats.countyData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        {item.county}
                      </td>
                      <td className="p-4 align-middle text-right">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Locations</CardTitle>
            <CardDescription>Most active venues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Rank
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Location
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Shows
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {stats.topLocations.map((location, index) => (
                    <tr
                      key={index}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">
                        {index + 1}
                      </td>
                      <td className="p-4 align-middle">
                        {location.location}
                      </td>
                      <td className="p-4 align-middle text-right">
                        {location.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Shows with Notes</span>
              <span className="text-sm text-muted-foreground">{stats.showsWithNotes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Shows without Notes</span>
              <span className="text-sm text-muted-foreground">{stats.totalShows - stats.showsWithNotes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Shows per Location</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalLocations > 0 ? (stats.totalShows / stats.totalLocations).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
