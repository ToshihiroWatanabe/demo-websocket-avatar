import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Rnd } from "react-rnd";

const sandBoxWidth = 320;
const sandBoxHeight = 320;

const sandBoxLeft = 32;
const sandBoxTop = 32;

let avatarX = Math.floor(Math.random() * sandBoxWidth);
let avatarY = Math.floor(Math.random() * sandBoxHeight);

const useStyles = makeStyles(() => ({
  sandBox: {
    position: "absolute",
    width: sandBoxWidth,
    height: sandBoxHeight,
    left: sandBoxLeft,
    top: sandBoxTop,
    border: "solid 2px #000",
    backgroundImage:
      "linear-gradient(0deg, transparent 31px, #333 32px), linear-gradient(90deg, transparent 31px, #333 32px)",
    backgroundColor: "#ddd",
    backgroundSize: "32px 32px",
  },
  myAvatar: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
  },
}));

function App() {
  const classes = useStyles();
  return (
    <>
      <div className={classes.sandBox}>
        <Rnd
          default={{
            x: avatarX,
            y: avatarY,
            width: 0,
            height: 0,
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
        >
          <Avatar className={classes.myAvatar}></Avatar>
        </Rnd>
      </div>
    </>
  );
}

export default App;
