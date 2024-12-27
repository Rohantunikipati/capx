import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StockEnum } from "@/lib/centralstrocks";
import { Button } from "../ui/button";
import { DualRangeSlider } from "../ui/rangeslider";
import { useCallback, useState } from "react";
import { api } from "@/lib/api";

const chartConfig = {
  stock: {
    label: "Stock Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function StockChart({
  id,
  avl,
  portfolioId,
}: {
  id: number;
  avl: number;
  portfolioId: number;
}) {
  //   const [chartData, setChartData] = useState<ChartData[]>([]); // Explicitly typed state
  console.log(portfolioId);

  const [values, setValues] = useState([1]);

  function useStockData() {
    return useQuery(
      ["stockData", StockEnum[id].symbol], // Use an array as the query key
      async () => {
        const API_KEY = "HGJWFG4N8AQ66ICD";
        const API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${StockEnum[id].symbol}&apikey=${API_KEY}`;

        const response = await fetch(API_URL);
        const data = await response.json();
        const weeklyData = data["Weekly Time Series"];

        const formattedData = Object.keys(weeklyData)
          .slice(0, 12) // Get the last 40 weeks
          .map(date => ({
            week: date,
            price: parseFloat(weeklyData[date]["4. close"]) * 75, // Convert to INR
          }))
          .reverse(); // Reverse to display oldest first

        const latestPrice =
          parseFloat(weeklyData[Object.keys(weeklyData)[0]]["4. close"]) * 75; // Latest price in INR

        return { chartData: formattedData, latestPrice };
      },
      {
        staleTime: Infinity, // Scale time to infinity
      }
    );
  }

  const queryClient = useQueryClient();

  const mutationSell = useMutation(
    async () => {
      console.log(values[0]);
      return await api.stocks.$post({
        json: {
          portfolioId: portfolioId,
          quantity: -values[0],
          centralizedStockId: id,
        },
      });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch the stocks query after a successful mutation
        queryClient.invalidateQueries(["stocks", portfolioId]);
      },
      onError: err => {
        console.error("Error selling stock:", err);
      },
    }
  );

  const handleSell = useCallback(() => {
    console.log("Clicked");
    mutationSell.mutate();
  }, [mutationSell]);

  const { data: chartData, isLoading, error } = useStockData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {StockEnum[id].name} Stock Price
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Last 12 Weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer className="mx-auto" width="80%" height={400}>
          <ChartContainer config={chartConfig}>
            <LineChart
              width={800}
              height={300}
              accessibilityLayer
              data={chartData?.chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                tickFormatter={value => {
                  // Format the date as "Jan 24", "Feb 24", "Mar 24"
                  var date = new Date(value);

                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  });
                }}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="price"
                type="natural"
                stroke="var(--color-stock)"
                strokeWidth={1}
                dot={{
                  fill: "var(--color-stock)",
                }}
                activeDot={{
                  r: 3,
                }}
              />
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
        {avl > 0 && (
          <CardFooter>
            <Card className=" w-[90%] mt-8 mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Sell This Stock
                  <div className="text-xl text-blue-600">
                    &#x20B9;
                    {chartData !== undefined
                      ? new Intl.NumberFormat().format(chartData.latestPrice)
                      : "N/A"}
                  </div>
                </CardTitle>
                <CardDescription>
                  <div className="w-full space-y-5 mt-8 mb-4">
                    <DualRangeSlider
                      label={value => value}
                      value={values}
                      onValueChange={setValues}
                      min={1}
                      max={avl - 1}
                      step={1}
                    />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSell}
                  variant="outline"
                  className="border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900"
                >
                  Sell
                </Button>
              </CardContent>
            </Card>
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
}
