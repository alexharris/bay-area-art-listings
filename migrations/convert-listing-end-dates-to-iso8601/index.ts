import {at, defineMigration, set, unset} from 'sanity/migrate'

const toEnd = 'EndDate'

export default defineMigration({
  title: 'convert listing end dates to ISO8601',
  documentTypes: ["listing"],

  migrate: {
    document(doc, context) {
      console.log('--------')
      console.log(doc._id)
      if (!doc[toEnd]) {
        console.log(doc._id + ' no end date');
        return;
      }
      var date = new Date((doc[toEnd] as Date)).toISOString().substring(0, 10);
      console.log(doc._id + ' has end date');
      return at(toEnd, set(date));
    },
  },
})
