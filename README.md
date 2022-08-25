# Discord Clone

Discord clone project for hackeru.

## Run Locally

Clone the project

```bash
  git clone https://github.com/Finis666/DiscordClone-backend server
```

Go to the project directory

```bash
  cd server
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGOURI=your mongo db url`

`TOKENSECRET=your_token_secret`

`PORT=3000`

`SMTP_PORT=587`

`SMTP_USER=your smtp credentials`

`SMTP_PASSWORD=your smtp credentials`

`CLIENT_SIDE_URL=http://localhost:3001`



## Tech Stack

**Client:** React, Redux, TailwindCSS, Socket.io-client, Axios

**Server:** Node, Express, MongoDB, Socket.io, JsonWebToken, NodeMailer



## Features

- Login & Register
- Forgot password
- Add friends
- Chat friends
- Admin panel
- Profile settings
- etc
