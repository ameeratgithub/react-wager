import logo from "./logo.svg";
// import "./App.css";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import Game from "./shared/Game";
import Nav from "./Nav";
import { Grid, Typography } from "@mui/material";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import Web3 from "web3";

function App() {
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask installed!");
      return;
    } else {
      console.log("Wallet exists");
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized accounts found");
    }
  };

  const [currentAccount, setCurrentAccount] = useState(null);

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install metamask");
    }
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address:", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const connectWalletButton = () => {
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
          <Typography gutterBottom variant="h6" component="div">
            Make sure you're connected to rinkeby testnet
          </Typography>
          <Button variant="contained" onClick={connectWalletHandler}>
            Connect to MetaMask to Proceed!
          </Button>
        </Grid>
      </Grid>
    );
  };

  const connectedButton = () => {
    return <Button variant="contained">Hi! I'm connected</Button>;
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="App">
      {currentAccount ? (
        <Router>
          <Nav />
          <Routes>
            <Route
              path="/game1"
              element={
                <Game
                  _contractAddress="0xBBA94eb4aC309FBD02fDB8532a9A761a77D20085"
                  wageAmount={0.01}
                  name="Game1"
                />
              }
            />

            <Route
              path="/game2"
              element={
                <Game
                  _contractAddress="0xC615Ab8420D2cE069b5dFB44d7923b507F7076E6"
                  wageAmount={0.03}
                  name="Game2"
                />
              }
            />

            <Route
              path="/"
              element={
                <Game
                  _contractAddress="0xBBA94eb4aC309FBD02fDB8532a9A761a77D20085"
                  wageAmount={0.01}
                  name="Game1"
                />
              }
            />
          </Routes>
        </Router>
      ) : (
        connectWalletButton()
      )}
    </div>
  );
}

export default App;
