import axios from "axios";

export const getDailyPrice = (args: {
  symbol: string;
  startDate: string;
  endDate: string;
}) => {
  const { symbol, startDate, endDate } = args;
  return axios.get(
    `//127.0.0.1:5000/daily_price/${symbol}?start_date=${startDate}&end_date=${endDate}`
  );
};
