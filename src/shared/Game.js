import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect } from "react";
import useState from "react-usestateref";
import MediaCard from "./MediaCard";
import game_start from "../game_start.jpg";
import game_enter from "../game_enter.jpg";
import game_wait from "../game_wait.png";
import game_withdraw from "../game_withdraw.jpeg";
let contractAddress;
const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_wageAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "loser",
        type: "address",
      },
    ],
    name: "GameResult",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "gameId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "game_state",
    outputs: [
      {
        internalType: "enum Game1.GAME_STATE",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "players",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "randomResult",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "randomness",
        type: "uint256",
      },
    ],
    name: "rawFulfillRandomness",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getRandomNumber",
    outputs: [
      {
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "start_new_game",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "enter",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [],
    name: "canWithdraw",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "withdrawFromGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
// let signer;
const GAME_STATE = {
  CLOSED: 0,
  OPEN: 1,
  CALCULATING_WINNER: 2,
};

function Game({ _contractAddress, wageAmount, name }) {
  contractAddress = _contractAddress;
  const [state, setState] = useState(null);
  const [contract, setContract, contractRef] = useState(null);
  const [canWithdraw, setCanWithdraw] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [heading, setHeading] = useState(null);
  // const [text, setText] = useState(null);
  // const [image, setImage] = useState(null);

  // const [won, setWon] = useState(false);
  const [openWonSnackbar, setOpenWonSnackbar] = useState(false);
  const [openLostSnackbar, setOpenLostSnackbar] = useState(false);

  const setGameState = async () => {
    const _contract = contract || contractRef.current;
    const _state = await _contract.game_state();
    console.log("State:", _state);
    setState(_state);
  };

  const shouldWithdraw = async () => {
    const _contract = contract || contractRef.current;
    const _canWithdraw = await _contract.canWithdraw();
    // const player = await _contract.players();
    // console.log(_canWithdraw, player);
    setCanWithdraw(_canWithdraw);
  };

  const startTheGame = async () => {
    setLoading(true);
    // console.log("Going to start the game");
    let tx = await contract.start_new_game();
    await tx.wait();
    setGameState();
    setLoading(false);
    // console.log("Game started");
  };
  const withdrawFromGame = async () => {
    setLoading(true);

    let tx = await contract.withdrawFromGame();
    await tx.wait();
    setGameState();
    shouldWithdraw();
    setLoading(false);
  };
  const enterTheGame = async () => {
    setLoading(true);

    console.log("Entering in the game:", (wageAmount * 1e18).toString());
    let tx = await contract.enter({
      value: (wageAmount * 1e18).toString(),
      gasLimit: 2100000,
      gasPrice: 8000000000,
    });
    await tx.wait();
    setGameState();
    shouldWithdraw();
    console.log("Entered in game");
    setLoading(false);
  };
  const initProvider = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();
        const _contract = new ethers.Contract(contractAddress, abi, signer);
        const signerAddress = await signer.getAddress();
        if (!contract) setContract(_contract);
        setGameState();
        shouldWithdraw();
        const randomResult = await _contract.randomResult();
        console.log("Random result:", randomResult.toString());
        _contract.on("GameResult", (winner, loser) => {
          console.log("Game result generated");
          if (winner === signerAddress) {
            setOpenWonSnackbar(true);
          } else if (loser === signerAddress) {
            setOpenLostSnackbar(true);
          }
        });
      } else {
        console.log("Ethereum not found");
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    if (!contract) initProvider();
  }, []);
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "80vh" }}
    >
      <Grid item xs={8}>
        {/* <Card sx={{ minWidth: 375 }}> */}
        {/* <CardContent> */}
        {/* <Typography
              sx={{ fontSize: 20 }}
              color="text.secondary"
              gutterBottom
            >
              Welcome to {name}
            </Typography> */}
        {/* <TextField
              id="standard-basic"
              label="Enter Amount"
              variant="standard"
              sx={{ minWidth: 375 }}
            /> */}

        {state === GAME_STATE.CLOSED && (
          <MediaCard
            title={"Welcome to " + name}
            image={game_start}
            details={
              "You're first in the game. Please start the game to allow players to enter"
            }
            action={startTheGame}
            actionText="Start The Game"
            loading={loading}
          />
          // <>
          //   <Typography
          //     sx={{ mt: 1.5, fontSize: 14 }}
          //     color="text.secondary"
          //   >
          //     You're first in the game. Please start the game to allow
          //     players to enter
          //   </Typography>
          //   <Button
          //     variant="contained"
          //     sx={{ mt: 3.5 }}
          //     onClick={startTheGame}
          //   >
          //     Start The Game
          //   </Button>
          // </>
        )}
        {state === GAME_STATE.OPEN && !canWithdraw && (
          <MediaCard
            title={"Please Enter in " + name}
            image={game_enter}
            details={`You're allowed to enter in the game. Entrance fee is ${wageAmount} ETH!`}
            action={enterTheGame}
            actionText="Enter In Game"
            loading={loading}
          />
          // <>
          //   <Typography sx={{ mt: 2.5, fontSize: 14 }} color="text.secondary">
          //     You're allowed to enter in the game. Entrance fee is {wageAmount}{" "}
          //     ETH!
          // //   </Typography>
          //   <Button variant="contained" sx={{ mt: 3.5 }} onClick={enterTheGame}>
          //     Enter In Game
          //   </Button>
          // </>
        )}
        {state === GAME_STATE.CALCULATING_WINNER && (
          <MediaCard
            title="We're calculating winner"
            image={game_wait}
            details={`Please wait for the result. Winner is being determined`}
          />
          // <>
          //   <Typography sx={{ mt: 2.5, fontSize: 16 }} color="text.secondary">
          //     Please wait for the result. Winner is being determined
          //   </Typography>
          //   <Button
          //         variant="contained"
          //         sx={{ mt: 3.5 }}
          //         onClick={enterTheGame}
          //       >
          //         Enter In Game
          //       </Button>
          // </>
        )}
        {canWithdraw && (
          <MediaCard
            title="Please wait for player"
            image={game_withdraw}
            details={`You're only player in the game. Please wait for other player. You
            can also withdraw your amount by click button below`}
            action={withdrawFromGame}
            actionText="Withdraw From Game"
            loading={loading}
          />
          // <>
          //   <Typography sx={{ mt: 1.5, fontSize: 14 }} color="text.secondary">
          // You're only player in the game. Please wait for other player. You
          // can also withdraw your amount by click button below
          //   </Typography>
          //   <Button
          //     variant="contained"
          //     sx={{ mt: 3.5 }}
          //     onClick={withdrawFromGame}
          //   >
          //     Withdraw From Game
          //   </Button>
          // </>
        )}
        {/* <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography> */}
        {/* </CardContent> */}
        {/* <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions> */}
        {/* </Card> */}
      </Grid>
      <Snackbar open={openWonSnackbar} autoHideDuration={6000}>
        <Alert severity="success" sx={{ width: "100%" }}>
          Congratulations! You have won the game.
        </Alert>
      </Snackbar>
      <Snackbar open={openLostSnackbar} autoHideDuration={6000}>
        <Alert severity="warning" sx={{ width: "100%" }}>
          Alas! You have lost the game. Better luck next time
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default Game;
