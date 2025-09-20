const ccxt = require("ccxt");
const { RSI } = require("technicalindicators");

//intit
const numberCheck = 50;
const timeframe = "1h";
const rsiNum = 70;
const endsWith = "/USDT";


async function getDatasWithRSI() {
  const exchange = new ccxt.binance({ enableRateLimit: true });

  // load market
  await exchange.loadMarkets();


  const symbols = Object.keys(exchange.markets)
    .filter(s => s.endsWith(endsWith))
    .slice(0, numberCheck); 
  const results = [];

  for (const symbol of symbols) {
    try {
      const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, 100); 
      const closes = ohlcv.map(c => c[4]);

      const rsiValues = RSI.calculate({ values: closes, period: 14 });
      const latestRsi = rsiValues[rsiValues.length - 1];

      if (latestRsi > rsiNum) {
        results.push({ symbol, rsi: latestRsi.toFixed(2) });
      }

      await new Promise(r => setTimeout(r, exchange.rateLimit));
    } catch (err) {
      console.error(`Errors :  ${symbol}: ${err.message}`);
    }
  }

  console.log(`Data with RSI > ${rsiNum}:`);
  console.table(results);
}

getDatasWithRSI();
