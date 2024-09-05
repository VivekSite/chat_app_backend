import mongoose from 'mongoose'

let connection: null | void | mongoose.Mongoose = null
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  retryWrites: true, // Enable retry writes
  retryReads: true, // Enable retry reads
  bufferCommands: false, // Disable mongoose buffering,
  connectTimeoutMS: 10000
}

const ConnectDB = async (MONGO_URI: string) => {
  if (connection == null) {
    connection = await mongoose.connect(MONGO_URI, options).catch(err => {
      if (err.code === 'ETIMEDOUT') {
        console.error('Connection timed out!', err)
      } else {
        console.error('Connection error:', err)
      }
    })
    console.log('New database connection established.')
  }

  return connection
}

if (mongoose.connection) {
  mongoose.connection.on('error', err => {
    console.error('Connection error:', err)
    process.exit(1)
  })
}

export { ConnectDB }
