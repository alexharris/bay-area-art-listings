import { createClient } from '@sanity/client';
import CsvExportButton from '../../components/CsvExportButton';

const client = createClient({
    projectId: 'ride9vgj',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: 'v2022-03-07'
});

export default async function LocationsPage() {
  const data = await client.fetch('*[_type == "location"]');

  return (
    <div>
        <CsvExportButton data={data} />
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <th className="border p-2 text-left">Location Name</th>
                    <th className="border p-2 text-left">Website</th>
                </tr>
            </thead>
            <tbody>
                {data?.map((location, index) => (
                    <tr key={index}>
                        <td className="border p-2">{location.Name}</td>
                        <td className="border p-2">
                            {location.Url ? (
                                <a href={location.Url} target="_blank" rel="noopener noreferrer">
                                    {location.Url}
                                </a>
                            ) : (
                                "Missing"
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}


