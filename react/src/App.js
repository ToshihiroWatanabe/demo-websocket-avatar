import React, { useState, useRef } from "react";
import { Avatar, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Rnd } from "react-rnd";
import SockJsClient from "react-stomp";

const SANDBOX_WIDTH = 320;
const SANDBOX_HEIGHT = 320;
const SANDBOX_LEFT = 32;
const SANDBOX_TOP = 32;
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const COLORS = [
  "#f44336", // red[500]
  "#e91e63", // pink[500]
  "#9c27b0", // purple[500]
  "#673ab7", // deepPurple[500]
  "#3f51b5", // indigo[500]
  "#2196f3", // blue[500]
  "#03a9f4", // lightBlue[500]
  "#00bcd4", // cyan[500]
  "#009688", // teal[500]
  "#4caf50", // green[500]
  "#8bc34a", // lightGreen[500]
  "#cddc39", // lime[500]
  "#ffc107", // amber[500]
  "#ff9800", // orange[500]
  "#ff5722", // deepOrange[500]
  "#795548", // brown[500]
];
const SOCKET_URL = "http://localhost:8080/websocket/";

let avatarX = Math.floor(Math.random() * SANDBOX_WIDTH);
let avatarY = Math.floor(Math.random() * SANDBOX_HEIGHT);
let gapX = 0;
let gapY = 0;

let myName = CHARS[Math.floor(Math.random() * CHARS.length)];
let mySessionId = "";
let isConnected = false;

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = 31 * hash + name.charCodeAt(i);
  }
  let index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};

const useStyles = makeStyles(() => ({
  sandBox: {
    position: "relative",
    top: SANDBOX_TOP,
    left: SANDBOX_LEFT,
    width: SANDBOX_WIDTH,
    height: SANDBOX_HEIGHT,
    marginBottom: SANDBOX_TOP,
    border: "2px solid #000",
    backgroundImage:
      "linear-gradient(0deg, transparent 31px, #333 32px), linear-gradient(90deg, transparent 31px, #333 32px)",
    backgroundColor: "#ddd",
    backgroundSize: "32px 32px",
  },
  myAvatar: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    backgroundColor: getAvatarColor(myName),
    boxShadow: "0px 0px 0px 2px #FFF",
  },
  tooltip: {
    whiteSpace: "pre-line",
  },
}));

function App() {
  const classes = useStyles();
  const $websocket = useRef(null);

  const [sessions, setSessions] = useState([
    { sessionId: "", name: "", avatarX: 0, avatarY: 0 },
  ]);

  const onMyAvatarMouseDown = (e) => {
    gapX =
      e.clientX -
      (e.target.getBoundingClientRect().x +
        e.target.getBoundingClientRect().width / 2);
    gapY =
      e.clientY -
      (e.target.getBoundingClientRect().y +
        e.target.getBoundingClientRect().height / 2);
  };

  const onDrag = (e) => {
    avatarX = e.clientX - SANDBOX_LEFT - gapX;
    avatarY = e.clientY - SANDBOX_TOP - gapY;
    if (avatarX > SANDBOX_WIDTH) {
      avatarX = SANDBOX_WIDTH;
    } else if (avatarX < 0) {
      avatarX = 0;
    }
    if (avatarY > SANDBOX_HEIGHT) {
      avatarY = SANDBOX_HEIGHT;
    } else if (avatarY < 0) {
      avatarY = 0;
    }
    if (isConnected) {
      $websocket.current.sendMessage(
        "/session",
        JSON.stringify({ name: myName, avatarX: avatarX, avatarY: avatarY })
      );
    }
  };

  const onConnected = () => {
    console.log("Connected!!");
    isConnected = true;
  };

  const onDisconnected = () => {
    console.log("Disonnected!!");
    isConnected = false;
    mySessionId = "";
  };

  const onMessageReceived = (message) => {
    if (mySessionId === "" && message.name === myName) {
      mySessionId = message.sessionId;
    }
    setSessions((sessions) => {
      let isDuplicated = false;
      for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].sessionId === message.sessionId) {
          isDuplicated = true;
          sessions[i].avatarX = message.avatarX;
          sessions[i].avatarY = message.avatarY;
          sessions = [...sessions];
        } else if (sessions[i].name === "") {
          sessions.splice(i, 1);
        }
      }
      if (!isDuplicated) {
        sessions = [
          ...sessions,
          {
            sessionId: message.sessionId,
            name: message.name,
            avatarX: message.avatarX,
            avatarY: message.avatarY,
          },
        ];
      }
      return sessions;
    });
  };

  const onLeaveMessageReceived = (message) => {
    setSessions((sessions) => {
      for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].sessionId === message.sessionId) {
          sessions.splice(i, 1);
        }
      }
      return [...sessions];
    });
  };

  return (
    <div className="App">
      <div className={classes.sandBox}>
        <Rnd
          default={{
            x: avatarX,
            y: avatarY,
          }}
          bounds="parent"
          enableResizing={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onDrag={onDrag}
          style={{ zIndex: 1 }}
        >
          <Avatar
            className={classes.myAvatar}
            onMouseDown={onMyAvatarMouseDown}
          >
            {myName}
          </Avatar>
        </Rnd>
      </div>
      {mySessionId !== "" && "あなた: " + mySessionId + " " + myName}
      {sessions.map((session, index) => (
        <div key={index}>
          <li>
            {session.sessionId} {session.name} ({session.avatarX},{" "}
            {session.avatarY})
          </li>
          {session.sessionId !== mySessionId && (
            <Tooltip
              title={session.name + "\r\n" + session.sessionId}
              classes={{ tooltip: classes.tooltip }}
            >
              <Avatar
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  left: session.avatarX + SANDBOX_LEFT,
                  top: session.avatarY + SANDBOX_TOP,
                  backgroundColor: getAvatarColor(session.name),
                }}
              >
                {session.name}
              </Avatar>
            </Tooltip>
          )}
        </div>
      ))}
      <SockJsClient
        url={SOCKET_URL}
        topics={["/topic/session"]}
        onConnect={onConnected}
        onDisconnect={onDisconnected}
        onMessage={(msg) => onMessageReceived(msg)}
        ref={$websocket}
      />
      <SockJsClient
        url={SOCKET_URL}
        topics={["/topic/session/leave"]}
        onMessage={(msg) => onLeaveMessageReceived(msg)}
      />
    </div>
  );
}

export default App;
