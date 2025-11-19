const mongoose = require('mongoose')
const { DB_URI } = require('./utils/config')

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(DB_URI)
    console.log('Connected to MongoDB for testing')
  }
})

afterAll(async () => {
  await mongoose.connection.close()
  console.log('Closed MongoDB connection')
})
