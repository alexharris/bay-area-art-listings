import {defineMigration, at, setIfMissing, unset} from 'sanity/migrate'

const from = 'imageUrl'
const to = 'Url'

export default defineMigration({
  title: 'move Location imageUrl to Location url',
  documentTypes: ["location"],

  migrate: {
    document(doc, context) {
      return [
        at(to, setIfMissing(doc[from])),
        at(from, unset())
      ]
    }
  }
})
