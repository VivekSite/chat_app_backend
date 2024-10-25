#### This is the backend Implementation of express and socket server for creating scalable chat application.

## Dependencies
- MongoDB 
- Redis
  - Using bullMQ library and it uses the redis to store the queue data.
  - By using queues I'm trying to reduce the time taken by DB operations. and after sending the message I'm adding the messages inot DB asynchronously.

## Run the code locally
- Clone the repo: `git clone https://github.com/VivekSite/chat_app_backend.git`.
- Install the MongoDB community version or we can also use connection string to connect with the MongoDB atlas.
- Same for Redis we can install redis server locally.
  - For MacOS run `brew install redis`.
  - For Linux run `sudo apt install redis-server`.
- Install all the other dependencies: `yarn install`.
- Now lets update the .env file
  - copy the .env.example file `cp .env.example .env`
  ```
    NODE_ENV=development
    PORT=8080
    MONGO_URI=mongodb://localhost:27017/chat_application
    REDIS_URL=redis://localhost:6379

    ACCESS_TOKEN_SECRET='*******************************************'
    REFRESH_TOKEN_SECRET='*******************************************'
    HASH_SECRET='*******************************************'
    OTP_SECRET='*******************************************'

    EMAIL_SENDER=example@gmail.com
    EMAIL_PASS_KEY='abcd efgh ijkl mnop'
  ```
  - Update all the secrets. we can use following command to generate the secrets:
  - `openssl rand -hex 64`
  - For `EMAIL_PASS_KEY` we can generate the App Password from `https://myaccount.google.com` 
- Start the development server: `yarn run dev`.

we can also use npm to run the scripts
