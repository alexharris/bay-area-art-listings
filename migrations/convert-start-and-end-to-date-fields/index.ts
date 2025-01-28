import {at, defineMigration, setIfMissing, unset} from 'sanity/migrate'


const fromStart = 'Start'
const toStart = 'StartDate'
const fromEnd = 'End'
const toEnd = 'EndDate'

export default defineMigration({
  title: 'convert start and end to date fields',
  documentTypes: ["listing"],

  migrate: {
    document(doc, context) {
      return [
        at(toStart, setIfMissing(doc[fromStart])),
        at(fromStart, unset()),
        at(toEnd, setIfMissing(doc[fromEnd])),
        at(fromEnd, unset())        
      ]

    },
  },
})