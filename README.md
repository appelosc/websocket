# Clipboard Sync App – WebSocket server

Socket.IO server that syncs text in real time between one user's devices. Whatever the user types on one device is sent to that user's other connected devices, and to nobody else.

Built with Node.js, Socket.IO and JWT.

This is one part of the Clipboard Sync App:

- [authn-authz](https://github.com/appelosc/authn-authz) (`project2` branch): authentication API that issues access and refresh tokens
- **websocket** (this repo): WebSocket server
- [websocket-frontend](https://github.com/appelosc/websocket-frontend): React and TypeScript web client
- [electron-websocket](https://github.com/appelosc/electron-websocket): the web client ported to an Electron desktop app

## How it works

1. **Authentication on connect.** A client must send a JWT in the Socket.IO handshake (`auth.token`). Middleware verifies it with `JWT_SECRET` before the connection is accepted. The connection is rejected with:
   - `No token provided` if the token is missing
   - `TokenExpiredError` if the token has expired, so the client knows to refresh it
   - `Invalid token` for any other verification error
2. **One room per user.** After connecting, the socket joins the room `room-<user id>`, where the user id comes from the token's `sub` claim.
3. **Messages stay within the room.** A `message` event from a socket is forwarded to the other sockets in the same room, which are the same user's other devices.
4. **Disconnect at token expiry.** The server disconnects each socket when its token expires (`exp`), so a client has to reconnect with a fresh token.

## Events

| Event     | Direction        | Payload | Description                                         |
| --------- | ---------------- | ------- | --------------------------------------------------- |
| `hello`   | server to client | string  | Sent once after a successful connection             |
| `message` | client to server | string  | Text to share with the user's other devices         |
| `message` | server to client | string  | Text received from one of the user's other devices  |

## Getting started

### Environment variables

Create a `.env` file in the project root:

| Variable     | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `JWT_SECRET` | Secret used to verify JWTs. Must match the secret the authentication API signs with |
| `PORT`       | Port the server listens on (default `3000`)                                 |
| `MODE`       | `development` runs with nodemon in Docker, otherwise `npm start`            |

### Run with Docker

```bash
docker compose up --build
```

The server is then available at `http://localhost:3002`.

### Run locally

```bash
npm install
npm run dev     # nodemon
# or
npm start
```

## CORS

Allowed origin: `https://people.arcada.fi`. To connect from a client on another origin, such as a local dev server, add it to the `origin` list in `src/server.js`.
