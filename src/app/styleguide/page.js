import { Badge } from '@/components/ui/badge';

function Section({ title, children }) {
    return (
        <section className="mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
                {title}
            </h2>
            {children}
        </section>
    );
}

function Swatch({ bg, label, hex }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className={`w-16 h-16 rounded-lg border border-black/10 ${bg}`} />
            <div className="text-xs font-medium text-gray-800">{label}</div>
            {hex && <div className="text-xs text-gray-400 font-mono">{hex}</div>}
        </div>
    );
}

function ChipExample({ label, active }) {
    return (
        <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap select-none ${
                active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
            }`}
        >
            <span>{label}</span>
            {active
                ? <span className="ml-0.5 leading-none">×</span>
                : <span className="opacity-40 text-xs">▾</span>
            }
        </div>
    );
}

function BadgeChipExample({ label, activeClass, inactiveClass }) {
    return (
        <div className="flex items-center gap-3">
            <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${activeClass}`}>
                {label} <span className="ml-0.5">×</span>
            </button>
            <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${inactiveClass}`}>
                {label}
            </button>
            <span className="text-xs text-gray-400">active / inactive</span>
        </div>
    );
}

export default function StyleguidePage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-1">Visual Design Language</h1>
                <p className="text-gray-500 text-sm">Bay Area Art Listings — component & color reference</p>
            </div>

            {/* Status Colors */}
            <Section title="Status Colors">
                <div className="flex flex-wrap gap-8 mb-4">
                    <Swatch bg="bg-green-300" label="On View Today" hex="green-300" />
                    <Swatch bg="bg-orange-200" label="Starting Today" hex="orange-200" />
                    <Swatch bg="bg-red-300" label="Ending Soon" hex="red-300" />
                    <Swatch bg="bg-yellow-400" label="Opening Event" hex="yellow-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    All status fills use <code className="bg-gray-100 px-1 rounded">text-black</code> for contrast. Never white text on these pastels.
                </p>
            </Section>

            {/* Status Badges */}
            <Section title="Status Badges (listing.js / FilterBadges.js)">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className="bg-green-300 hover:bg-green-400 text-black">On View Today</Badge>
                    <Badge className="bg-orange-200 hover:bg-orange-300 text-black border border-orange-300">Starting Today</Badge>
                    <Badge className="bg-red-300 hover:bg-red-400 text-black">Ending Soon</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-orange-300 hover:bg-orange-50">Starting Today</Badge>
                    <Badge variant="outline" className="border-red-300 hover:bg-red-50">Ending Soon</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Solid badges used in sidebar FilterBadges and listing cards. Outline variants used in DateNote inline labels.
                </p>
            </Section>

            {/* Opening Event Dot */}
            <Section title="Opening Event Indicator">
                <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                    <span className="font-medium">Opening Reception</span>
                    <span className="text-gray-400 text-xs ml-1">— also used in What chip when openings filter is active</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    <code className="bg-gray-100 px-1 rounded">bg-yellow-400</code>, 8×8px circle, always with black/dark text alongside.
                </p>
            </Section>

            {/* Filter Chips — Main */}
            <Section title="Filter Chips — Main (What / When / Where)">
                <div className="flex flex-wrap gap-2 mb-3">
                    <ChipExample label="All" active={false} />
                    <ChipExample label="Upcoming" active={true} />
                    <ChipExample label="Anytime" active={false} />
                    <ChipExample label="Next 7 Days" active={true} />
                    <ChipExample label="Anywhere" active={false} />
                    <ChipExample label="San Francisco" active={true} />
                </div>
                <div className="space-y-1 text-xs text-gray-500 font-mono">
                    <div><span className="text-gray-400">active: </span>bg-gray-900 text-white border-gray-900</div>
                    <div><span className="text-gray-400">inactive: </span>bg-white text-gray-700 border-gray-300</div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Single dark active state — no per-chip accent colors.</p>
            </Section>

            {/* Filter Chips — Badge */}
            <Section title="Filter Chips — Badge (mobile chip row)">
                <div className="flex flex-col gap-3">
                    <BadgeChipExample
                        label="👁️ On View Today"
                        activeClass="bg-green-300 border-green-400 text-black hover:bg-green-400"
                        inactiveClass="bg-gray-100 text-gray-600 border-gray-200"
                    />
                    <BadgeChipExample
                        label="🌟 Starting Today"
                        activeClass="bg-orange-200 border-orange-300 text-black hover:bg-orange-300"
                        inactiveClass="bg-gray-100 text-gray-600 border-gray-200"
                    />
                    <BadgeChipExample
                        label="⏳ Ending Soon"
                        activeClass="bg-red-300 border-red-400 text-black hover:bg-red-400"
                        inactiveClass="bg-gray-100 text-gray-600 border-gray-200"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Inactive state is always <code className="bg-gray-100 px-1 rounded">bg-gray-100 text-gray-600 border-gray-200</code>. Active colors match the sidebar badge fills.
                </p>
            </Section>

            {/* Neutral / Surface Colors */}
            <Section title="Surfaces & Neutrals">
                <div className="flex flex-wrap gap-8 mb-3">
                    <Swatch bg="bg-white border border-gray-200" label="Default bg" hex="white" />
                    <Swatch bg="bg-gray-50" label="Card / location" hex="gray-50" />
                    <Swatch bg="bg-gray-100" label="Inactive chip" hex="gray-100" />
                    <Swatch bg="bg-gray-900" label="Active chip" hex="gray-900" />
                </div>
            </Section>

            {/* Typography */}
            <Section title="Typography">
                <div className="space-y-4">
                    <div>
                        <p className="text-3xl">Exhibition Title</p>
                        <code className="text-xs text-gray-400">text-3xl (lg), text-2xl (mobile)</code>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Label / section heading</p>
                        <code className="text-xs text-gray-400">text-sm font-medium</code>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Date range, venue name</p>
                        <code className="text-xs text-gray-400">text-sm font-semibold</code>
                    </div>
                    <div>
                        <p className="text-sm text-gray-700">Body / notes text</p>
                        <code className="text-xs text-gray-400">text-sm text-gray-700</code>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Meta / secondary</p>
                        <code className="text-xs text-gray-400">text-xs text-gray-500</code>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Section label</p>
                        <code className="text-xs text-gray-400">text-xs font-semibold uppercase tracking-widest text-gray-400</code>
                    </div>
                </div>
            </Section>

            {/* Borders */}
            <Section title="Borders & Dividers">
                <div className="space-y-4">
                    <div>
                        <div className="border-b border-dashed border-gray-400 pb-2 mb-1 text-sm text-gray-600">Listing row separator</div>
                        <code className="text-xs text-gray-400">border-b border-dashed border-gray-400</code>
                    </div>
                    <div>
                        <div className="border-b border-gray-200 pb-2 mb-1 text-sm text-gray-600">Section / panel border</div>
                        <code className="text-xs text-gray-400">border-b border-gray-200</code>
                    </div>
                    <div>
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 mb-1">Location card surface</div>
                        <code className="text-xs text-gray-400">bg-gray-50 rounded p-4</code>
                    </div>
                </div>
            </Section>
        </div>
    );
}
