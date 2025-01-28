import {at, defineMigration, set, unset} from 'sanity/migrate'

const toStart = 'StartDate'

export default defineMigration({
  title: 'convert listing dates to ISO8601',
  documentTypes: ["listing"],

  migrate: {
    document(doc, context) {
      if (!doc[toStart]) {
        return [];
      }
      var date = new Date((doc[toStart] as Date)).toISOString().substring(0, 10);
      return [
        at(toStart, set(date)),     
      ]

    },
  },
})
