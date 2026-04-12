const createMonthListItems = (S, year) => {
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
    { title: 'December', start: '12-01', end: '01-01' },
  ];

  return months.map((month) =>
    S.listItem()
      .title(month.title)
      .child(
        S.documentList()
          .title(month.title)
          .filter(
            `_type == "listing" && StartDate >= "${year}-${month.start}" && StartDate < "${year}-${month.end}"`
          )
          .menuItems(S.documentTypeList('listing').getMenuItems())
          .child((documentId) =>
            S.document()
              .documentId(documentId)
              .schemaType('listing')
          )
      )
  );
};

export const structure = (S) =>
  S.list()
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
        .title('Listings')
        .child(
          S.list()
            .title('Years')
            .items([
              S.listItem()
                .title('2025')
                .child(S.list().title('Months').items(createMonthListItems(S, '2025'))),
            ])
        ),
      S.listItem()
        .title('Location')
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
      ...S.documentTypeListItems().filter(item => !['settings', 'location'].includes(item.getId())),
    ]);
