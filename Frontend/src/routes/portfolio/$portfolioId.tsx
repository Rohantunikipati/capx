import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/ui/main'
import { useCallback, useEffect, useState } from 'react'
import { StockEnum } from '@/lib/centralstrocks'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import CountUp from 'react-countup'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DualRangeSlider } from '@/components/ui/rangeslider'
import { SellSheet } from '@/components/custom/sellSheel'
// import StockPrices from '@/components/custom/stock-price-dummy'
import { Separator } from '@/components/ui/separator'

// Extend FileRoutesByPath to include your dynamic route
declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/portfolio/$portfolioId': {
      portfolioId: string
    }
  }
}

interface Stock {
  id: number
  quantity: number
  buyPrice: number
  portfolioId: number
  centralizedStockId: number
}

// Define the route
export const Route = createFileRoute('/portfolio/$portfolioId')({
  component: PortfolioRouteComponent,
})

// Component for the route
function PortfolioRouteComponent() {
  const { portfolioId }: { portfolioId: string } = Route.useParams()

  const queryClient = useQueryClient()

  const mutation = useMutation(
    async (centralizedStockId: number) => {
      return await api.stocks.$post({
        json: {
          portfolioId: Number(portfolioId),
          centralizedStockId,
          quantity: values[0], // Dynamic or state-driven value
          buyPrice: 200, // Dynamic or state-driven value
        },
      })
    },
    {
      onSuccess: () => {
        // Invalidate and refetch the stocks query after a successful mutation
        queryClient.invalidateQueries(['stocks', portfolioId])
      },
      onError: (err) => {
        console.error('Error buying stock:', err)
      },
    },
  )

  const handleBuy = useCallback(
    (centralizedStockId: number) => {
      mutation.mutate(centralizedStockId)
    },
    [mutation],
  )

  type Stock = {
    id: number
    quantity: number
    buyPrice: number
    centralizedStockId: number
  }

  type Portfolio = {
    portfolio: {
      id: number
      name: string
      stocks: Stock[]
    }
    portfolioValue: number
  }

  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null)

  const { data, error, isLoading } = useQuery<Portfolio>(
    ['stocks', portfolioId],
    async () => {
      const response = await fetch(`/api/portfolio/${portfolioId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio')
      }

      const data: Portfolio = await response.json()

      if (!data.portfolio) {
        throw new Error('Portfolio not found')
      }

      return data
    },
  )

  useEffect(() => {
    if (data) {
      setPortfolioData(data) // Update state with fetched data
    }
  }, [data]) // Only run when `data` changes

  const [values, setValues] = useState([10])

  return (
    <>
      <Main fixed>
        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Portfolio value
                  </CardTitle>
                  &#x20B9;
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    &#x20B9;
                    <CountUp
                      end={data?.portfolioValue ?? 100}
                      preserveValue
                      duration={2} // Animation duration in seconds
                      useEasing={true}
                      separator="," // Optional: Adds a comma as a thousand separator
                    />{' '}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              {data?.portfolio?.stocks && data.portfolio.stocks.length > 0 ? (
                data.portfolio.stocks.map((stock: Stock) => (
                  <Card key={stock.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {StockEnum[stock.centralizedStockId]?.name ||
                          'Unknown Stock'}
                      </CardTitle>
                      <div className="flex gap-1">
                        {/* Buy Stock Dialog */}
                        <Dialog>
                          <DialogTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900"
                            >
                              Buy
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold tracking-tight">
                                Do you want to buy this stock?
                              </DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                This action cannot be undone. Please confirm
                                your purchase.
                              </DialogDescription>
                              <div className="mb-1 text-xl font-semibold">
                                Current stock price: &#x20B9;200
                              </div>
                              <div>
                                <div className="w-full space-y-5 mt-8 mb-4">
                                  <DualRangeSlider
                                    label={(value) => value}
                                    value={values}
                                    onValueChange={setValues}
                                    min={1}
                                    max={100}
                                    step={1}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <DialogTrigger>
                                  <Button
                                    onClick={() =>
                                      handleBuy(stock.centralizedStockId)
                                    }
                                    variant="outline"
                                    className="border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900"
                                  >
                                    Confirm Buy
                                  </Button>
                                </DialogTrigger>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                        {/* Sell Stock Sheet */}
                        <SellSheet
                          portfolioId={Number(portfolioId)}
                          id={stock.centralizedStockId}
                          avl={stock.quantity}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        &#x20B9;
                        <CountUp
                          key={stock.id}
                          end={Number(stock.buyPrice) * Number(stock.quantity)}
                          preserveValue
                          duration={2}
                          useEasing={true}
                          separator=","
                        />
                      </div>
                      <div className="flex gap-3 mt-2">
                        <p className="text-sm text-muted-foreground">
                          Quantity: {stock.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Buy Price: &#x20B9;{stock.buyPrice}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No stocks available
                </p>
              )}
            </div>
          </TabsContent>
          <div className="">
            <Separator className="px-10" />
          </div>
          {/* <TabsContent value="analytics">
            <Stocks portfolioId={Number(portfolioId)} />
          </TabsContent> */}
        </Tabs>
        {/* <StockPrices id={Number(portfolioId)} /> */}
      </Main>
    </>
  )
}
