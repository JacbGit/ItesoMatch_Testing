const mongoose = require('mongoose')
const { DB_URI, PORT } = require('./utils/config')
const server = require('./app')

const mongoDB = DB_URI

main().catch((err) => console.log(err))

async function main () {
  await mongoose.connect(mongoDB)
  server.listen(PORT, () => {
    console.log('Server listening on https://itesomatch.xyz')
  })
}

main()
