import React, { useEffect, useRef, useState } from "react";
import moment, { Moment } from "moment";
import { Form, Button, Input, Select, DatePicker, Space } from "antd";
import { RangeValue } from "rc-picker/lib/interface";
import { getDailyPrice } from "../../services/daily_price";
import DataSet from "@antv/data-set";
import { Chart } from "@antv/g2";

const { RangePicker } = DatePicker;

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  date: string;
}

const Dashboard = () => {
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [dateRange, setDateRange] = useState<RangeValue<Moment>>();
  const [dailyPrices, setDailyPrices] = useState<{ [key: string]: OHLC[] }>({});
  const chartContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    selectedTickers.forEach((symbol) => {
      if (dateRange?.length) {
        getDailyPrice({
          symbol: symbol,
          startDate: dateRange[0]?.format("YYYYMMDD") as string,
          endDate: dateRange[1]?.format("YYYYMMDD") as string,
        })
          .then((res) => res.data)
          .then((data) => {
            setDailyPrices({
              [symbol]: data,
            });
          });
      }
    });
  }, [selectedTickers, dateRange]);

  useEffect(() => {
    Object.values(dailyPrices).forEach((values: { open: number }[]) => {
      const ds = new DataSet();
      const dv = ds.createView();
      dv.source(values).transform({
        type: "map",
        callback: (obj) => {
          obj.trend = obj.open <= obj.close ? "上涨" : "下跌";
          obj.range = [obj.open, obj.close, obj.high, obj.low];
          return obj;
        },
      });

      const chart = new Chart({
        container: chartContainerRef.current as HTMLElement,
        autoFit: true,
        height: 400,
        padding: [10, 40, 40, 40],
      });
      chart.scale({
        date: {
          type: "timeCat",
          range: [0, 1],
          tickCount: 4,
        },
        trend: {
          values: ["上涨", "下跌"],
        },
        volumn: { alias: "成交量" },
        open: { alias: "开盘价" },
        close: { alias: "收盘价" },
        high: { alias: "最高价" },
        low: { alias: "最低价" },
        range: { alias: "股票价格" },
      });
      const kView = chart.createView({
        region: {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0.7 },
        },
      });
      kView.data(dv.rows);
      kView
        .schema()
        .position("date*range")
        .color("trend", (val) => {
          if (val === "上涨") {
            return "#f04864";
          }

          if (val === "下跌") {
            return "#2fc25b";
          }

          return "";
        })
        .shape("candle")
        .tooltip("date*open*close*high*low", (date, open, close, high, low) => {
          return {
            name: date,
            value:
              '<br><span style="padding-left: 16px">开盘价：' +
              open +
              "</span><br/>" +
              '<span style="padding-left: 16px">收盘价：' +
              close +
              "</span><br/>" +
              '<span style="padding-left: 16px">最高价：' +
              high +
              "</span><br/>" +
              '<span style="padding-left: 16px">最低价：' +
              low +
              "</span>",
          };
        });
      chart.render();
    });
  }, [dailyPrices]);

  const handleDateRangeChange = (values: RangeValue<Moment>) => {
    setDateRange(values);
  };

  return (
    <div className="dashboard">
      <Form>
        <Space>
          <Form.Item label="tickers">
            <Select
              mode="multiple"
              value={selectedTickers}
              onChange={setSelectedTickers}
              style={{ width: 100 }}
            >
              {[
                {
                  symbol: "MSFT",
                },
                {
                  symbol: "BILI",
                },
              ].map((e) => (
                <Select.Option key={e.symbol} value={e.symbol.toLowerCase()}>
                  {e.symbol}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="date range">
            <RangePicker value={dateRange} onChange={handleDateRangeChange} />
          </Form.Item>
        </Space>
      </Form>
      <div ref={chartContainerRef}></div>
    </div>
  );
};

export default Dashboard;
