import { client as sanityClient } from './lib/client';

const getMonthCounts = async (client, year) => {
  const results = await client.fetch(
    `*[_type == "listing" && StartDate >= "${year}-01-01" && StartDate < "${year + 1}-01-01"] { "month": string::split(StartDate, "-")[1] }`
  );
  const counts = {};
  results.forEach(({ month }) => {
    if (month) counts[month] = (counts[month] || 0) + 1;
  });
  return counts;
};

const createMonthListItems = (S, year, counts = {}) => {
  const months = [
    { title: 'January', start: '01-01', end: '02-01' },
    { title: 'February', start: '02-01', end: '03-01' },
    { title: 'March', start: '03-01', end: '04-01' },
    { title: 'April', start: '04-01', end: '05-01' },
    { title: 'May', start: '05-01', end: '06-01' },
    { title: 'June', start: '06-01', end: '07-01' },
    { title: 'July', start: '07-01', end: '08-01' },
    { title: 'August', start: '08-01', end: '09-01' },
    { title: 'September', start: '09-01', end: '10-01' },
    { title: 'October', start: '10-01', end: '11-01' },
    { title: 'November', start: '11-01', end: '12-01' },
    { title: 'December', start: '12-01', end: '01-01', endYearOffset: 1 },
  ];

  return months.map((month) => {
    const monthKey = month.start.split('-')[0];
    const count = counts[monthKey] || 0;
    const title = count ? `${month.title} (${count})` : month.title;
    const endYear = year + (month.endYearOffset || 0);

    return S.listItem()
      .title(title)
      .child(
        S.documentList()
          .title(month.title)
          .filter(
            `_type == "listing" && StartDate >= "${year}-${month.start}" && StartDate < "${endYear}-${month.end}"`
          )
          .menuItems(S.documentTypeList('listing').getMenuItems())
          .child((documentId) =>
            S.document()
              .documentId(documentId)
              .schemaType('listing')
          )
      );
  });
};

export const structure = async (S) => {
  const [counts2024, counts2025, counts2026] = await Promise.all([
    getMonthCounts(sanityClient, 2024),
    getMonthCounts(sanityClient, 2025),
    getMonthCounts(sanityClient, 2026),
  ]);

  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Settings')
        .child(
          S.document()
            .schemaType('settings')
            .documentId('settings')
        ),
      S.divider(),
      S.listItem()
        .title('Listings by Year')
        .child(
          S.list()
            .title('Years')
            .items([
              S.listItem()
                .title('2026')
                .child(S.list().title('Months').items(createMonthListItems(S, 2026, counts2026))),
              S.listItem()
                .title('2025')
                .child(S.list().title('Months').items(createMonthListItems(S, 2025, counts2025))),
              S.listItem()
                .title('2024')
                .child(S.list().title('Months').items(createMonthListItems(S, 2024, counts2024))),
            ])
        ),
      S.listItem()
        .title('Locations')
        .schemaType('location')
        .child(
          S.list()
            .title('Locations')
            .items([
              S.listItem()
                .title('All Locations')
                .child(
                  S.documentList()
                    .title('All Locations')
                    .filter('_type == "location"')
                    .child((id) => S.document().documentId(id).schemaType('location'))
                ),
              S.listItem()
                .title('Manual Override')
                .child(
                  S.documentList()
                    .title('Manual Override')
                    .filter('_type == "location" && hoursManualOverride == true')
                    .child((id) => S.document().documentId(id).schemaType('location'))
                ),
            ])
        ),
      S.listItem()
        .title('Listings')
        .schemaType('listing')
        .child(S.documentTypeList('listing').title('Listings')),
      S.listItem()
        .title('Pages')
        .schemaType('page')
        .child(S.documentTypeList('page').title('Pages')),
      ...S.documentTypeListItems().filter(item => !['settings', 'location', 'listing', 'page'].includes(item.getId())),
    ]);
};
