import {
  FaApple,
  FaMicrosoft,
  FaAmazon,
  FaGoogle,
  FaFacebook,
} from "react-icons/fa";
import { TbBrandNetflix } from "react-icons/tb";
import {
  SiAdobeaftereffects,
  SiIntel,
  SiNvidia,
  SiTesla,
} from "react-icons/si";
import { Button } from "../ui/button";
import { Main } from "../ui/main";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DualRangeSlider } from "@/components/ui/rangeslider";
import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const filteredApps = [
  {
    id: 1,
    name: "Apple Inc.",
    logo: <FaApple />,
    connected: false,
    desc: "Explore and manage Apple Inc. related tools and integrations.",
  },
  {
    id: 2,
    name: "Microsoft Corp.",
    logo: <FaMicrosoft />,
    connected: true,
    desc: "Integrate Microsoft Corp. products for enhanced productivity.",
  },
  {
    id: 3,
    name: "Tesla Inc.",
    logo: <SiTesla />,
    connected: false,
    desc: "Sync Tesla Inc. tools for real-time data and management.",
  },
  {
    id: 4,
    name: "Amazon.com Inc.",
    logo: <FaAmazon />,
    connected: true,
    desc: "Connect Amazon services for seamless e-commerce solutions.",
  },
  {
    id: 5,
    name: "Alphabet Inc.",
    logo: <FaGoogle />,
    connected: true,
    desc: "Integrate Alphabet Inc. (Google) tools for collaboration.",
  },
  {
    id: 6,
    name: "Meta Platforms Inc.",
    logo: <FaFacebook />,
    connected: false,
    desc: "Connect Meta Platforms for efficient team communication.",
  },
  {
    id: 7,
    name: "NVIDIA Corporation",
    logo: <SiNvidia />,
    connected: false,
    desc: "Effortlessly manage NVIDIA tools for graphics and AI workloads.",
  },
  {
    id: 8,
    name: "Netflix Inc.",
    logo: <TbBrandNetflix />,
    connected: true,
    desc: "Collaborate and sync with Netflix Inc. tools.",
  },
  {
    id: 9,
    name: "Adobe Inc.",
    logo: <SiAdobeaftereffects />,
    connected: false,
    desc: "Integrate Adobe Inc. for design and creative workflows.",
  },
  {
    id: 10,
    name: "Intel Corporation",
    logo: <SiIntel />,
    connected: true,
    desc: "Sync Intel Corporation tools for advanced computing solutions.",
  },
];

interface AvlStocks {
  portfolioId: number;
}

export const Stocks: React.FC<AvlStocks> = ({ portfolioId }) => {
  const [values, setValues] = useState([10]);

  const mutation = useMutation(
    async (centralizedStockId: number) => {
      console.log(portfolioId);
      return await api.stocks.$post({
        json: {
          portfolioId: Number(portfolioId),
          centralizedStockId,
          quantity: values[0], // Dynamic or state-driven value
          buyPrice: 200, // Dynamic or state-driven value
        },
      });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch the stocks query after a successful mutation
      },
      onError: err => {
        console.error("Error buying stock:", err);
      },
    }
  );

  const handleBuy = useCallback(
    (centralizedStockId: number) => {
      console.log(centralizedStockId);
      mutation.mutate(centralizedStockId);
    },
    [mutation]
  );

  return (
    <Main fixed>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stocks Store</h1>
        <p className="text-muted-foreground">
          Here&apos;s a list of some stocks for the integration!
        </p>
      </div>
      <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map(app => (
          <li key={app.id} className="rounded-lg border p-4 hover:shadow-md">
            <div className="mb-8 flex items-center justify-between">
              <div
                className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}
              >
                <div className=" scale-150">{app.logo}</div>
              </div>
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
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                    <div className="mb-1 text-xl font-semibold">
                      Current stock price &#x20B9;200
                    </div>
                    <div>
                      <div className="w-full space-y-5 mt-8 mb-4">
                        <DualRangeSlider
                          label={value => value}
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
                          onClick={() => handleBuy(app.id)}
                          variant="outline"
                          className="border border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900"
                        >
                          Buy
                        </Button>
                      </DialogTrigger>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <h2 className="mb-1 font-semibold">{app.name}</h2>
              <p className="line-clamp-2 text-gray-500">{app.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </Main>
  );
};
