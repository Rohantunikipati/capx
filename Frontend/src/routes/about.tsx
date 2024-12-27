import { usePortfolioStore } from "@/Hooks/use-fetch-data";
import { useModal } from "@/Hooks/use-modal-hook";
import { api } from "@/lib/api";
// import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/about")({
  component: Index,
});

// const get_user_portfolios = async () => {
//   const res = await api.portfolio.$get();
//   const data_recived = await res.json();
//   return data_recived;
// };

const fetchPortfolioData = async () => {
  const res = await api.portfolio.$get("/");
  const data = await res.json();
  console.log(data);
  return data.portfolios || []; // Ensure the response is extracted correctly
};

function Index() {
  const onOpen = useModal(state => state.onOpen);
  const isOpen = useModal(state => state.isOpen);

  const { data: portfolios, setData } = usePortfolioStore();

  // Load portfolio data on component mount
  useEffect(() => {
    const loadPortfolioData = async () => {
      const portfolioData = await fetchPortfolioData();
      console.log(portfolioData);
      setData(portfolioData);
    };
    loadPortfolioData();
  }, [setData]);

  // const { isLoading, data: data_recived } = useQuery({
  //   queryKey: ["get_user_portfolios"],
  //   queryFn: get_user_portfolios,
  // });

  const navigate = useNavigate();

useEffect(() => {
  if (portfolios && portfolios.length > 0) {
    // Navigate only if portfolios exist and have a valid first item
    //@ts-ignore
    if (portfolios[0]?.id) {
      navigate({ to: `/portfolio/${portfolios[0].id}` });
    }
  } else if (!isOpen) {
    // Open the form if portfolios are not available and modal is not open
    onOpen();
  }
}, [portfolios, isOpen, navigate, onOpen]);


  // if (isLoading) return null;

  return <>content</>;
}
