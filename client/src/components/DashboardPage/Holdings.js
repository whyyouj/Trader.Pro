import * as React from "react";
import { useState } from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "../Template/Title";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Button from "@mui/material/Button";
import SellPage from "./SellPage";
import { requirePropFactory } from "@mui/material";
import CreateRow from "./createRow";
import styles from "./Holdings.css";

export default function Holdings() {
  const [openSell, setSell] = useState(false);
  const [sellStock, setSellStock] = useState("");
  const [sellQuantity, setQuantity] = useState(0);
  const [HeldStocks, setHeldStocks] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [stockArray, setStockArray] = useState([]);
  const [tickerStrings, setTickerStrings] = useState("");

  //Finding user (for sell page)
  var userURL = "http://localhost:3001/api/users/find/";
  var userId = user.id;
  var finalURL = userURL + String(userId);

  //Finding Stocks Held
  var stockOwnURL = "http://localhost:3001/api/users/stocksHeld/";
  var userId = user.id;
  var StocksHeldURL = stockOwnURL + String(userId);

  useEffect(() => {
    axios.get(finalURL).then((response) => {
      setCurrentUser(response.data);
      console.log(currentUser, "CurrentUser")
    });
      axios.get(StocksHeldURL).then((response) => {
        setHeldStocks(response.data);
        console.log(HeldStocks, "HeldStocks")

    });
  }, []);



  useEffect(() => {
    setTickerStrings(gettingTickerString());
    console.log("Ticker Strings: ", tickerStrings);
  }, [HeldStocks]);


  // function handleSell() {
  //     setSell(true);
  //     // setSellStock(stock);
  // }

  const handleSell = (stock, quantity) => {
    setSell(true);
    setSellStock(stock);
    setQuantity(quantity);
  };

  //Getting the list of stocks the user owns

  console.log("Held Stocks", HeldStocks);

  const gettingTickerString = () => {

  var HeldStocksArray = [];

  for (let i = 0; i < HeldStocks.length; i++) {
    HeldStocksArray.push(HeldStocks[i]);
  }

 

  //Ticker Strings
  var temp = "";

  for (let i = 0; i < HeldStocksArray.length; i++) {
    if (HeldStocksArray[i] !== undefined) {
      if (i !== HeldStocksArray.length - 1) {
        temp = temp + HeldStocksArray[i].ticker + ",";
      } else {
        temp = temp + HeldStocksArray[i].ticker;
      }
    }
  }

  console.log("temp", temp);
  
  const apiKey = "pk_9249432a0cdb4779a11da39eb35f224a";
    var url = `https://cloud.iexapis.com/v1/stock/market/batch?&types=quote&symbols=${temp}&token=${apiKey}`;
    axios
      .get(url)
      .then((response) => setStockArray(response.data))
      .catch((error) => console.log(error));

    console.log(stockArray, "stockArray")
  
  
  return temp
}

//Just her so the bottom will not give an error
var HeldStocksArray = [];

  for (let i = 0; i < HeldStocks.length; i++) {
    HeldStocksArray.push(HeldStocks[i]);
  }
  //Getting price
  useEffect(() => {
    
  }, []);

  const latestPriceDict = {};

  for (const [key, value] of Object.entries(stockArray)) {
    latestPriceDict[key] = value.quote.latestPrice;
  }

  console.log(latestPriceDict, "latestPriceDict");
  // for (const [key,value] i < stockArray.length; i++) {
  //   if (stockArray[i] !== undefined) {
  //     latestPriceDict[stockArray[i].quote.symbol] = stockArray[i].quote.latestPrice;
  //   }
  // }

  //Row making function
  // function createData(
  //   id,
  //   ticker,
  //   name,
  //   quantity,
  //   pricePurchase,
  //   totalPurchase,
  //   priceCurrent,
  //   priceTotal,
  //   difference
  // ) {
  //   return {
  //     id,
  //     ticker,
  //     name,
  //     quantity,
  //     pricePurchase,
  //     totalPurchase,
  //     priceCurrent,
  //     priceTotal,
  //     difference,
  //   };
  // }

  //Final row to be mapped

  return (
    <React.Fragment>
      <Title>Stocks in your Portfolio</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Company Ticker</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Price of Purchase</TableCell>
            <TableCell>Purchase Total</TableCell>
            <TableCell align="right">Current Price</TableCell>
            <TableCell align="right">Current Total</TableCell>
            <TableCell align="right">Difference</TableCell>
            <TableCell align="right">Sell</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {HeldStocksArray.map((row) => {
            const currentPrice = latestPriceDict[row.ticker];

            const difference =
              (((currentPrice - row.price) / currentPrice) * 100).toFixed(1) +
              "%";
            const purchaseTotal = Number(row.quantity) * Number(row.price);
            const currentTotal = Number(row.quantity) * Number(currentPrice);

            return (
              <TableRow key={row.id}>
                <TableCell>{row.ticker}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{`$${row.price}`}</TableCell>
                <TableCell>{`$${purchaseTotal}`}</TableCell>
                <TableCell align="right">{`$${currentPrice}`}</TableCell>
                <TableCell align="right">{`$${currentTotal}`}</TableCell>
                <TableCell
                  align="right"
                  className={difference > 0 ? styles.positive : styles.negative}
                >
                  {difference}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => handleSell(row.ticker, row.quantity)}
                  >
                    Sell
                  </Button>
                </TableCell>
                <SellPage
                  open={openSell}
                  onClose={() => setSell(false)}
                  stock={sellStock}
                  quantity={sellQuantity}
                  user={currentUser[0]}
                  stocksHeld={HeldStocks}
                  price={currentPrice}
                />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <br />
      <Typography color="textSecondary" align="center">
        {new Date().toDateString()}
      </Typography>
    </React.Fragment>
  );
}
