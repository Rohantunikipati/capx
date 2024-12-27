import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useModal } from "@/Hooks/use-modal-hook";
import { Modal } from "../custom/modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const formSchema = z.object({
  portfolio_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

export const UsePortfolioModal = () => {
  const portfoliomodal = useModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolio_name: "",
    },
  });

  // 2. Define a submit handler.

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    const res = await api.portfolio.$post({
      json: { portfolio_name: value.portfolio_name },
    });

    if (!res.ok) {
      console.error("some error");
      return;
    }

    try {
      const data = await res.json();
      console.log(data);

      if ("portfolio" in data) {
        const portfolioId = `${data.portfolio.id}`;
        window.location.href = `/portfolio/${portfolioId}`;
      } else {
        console.error("Error:");
      }
    } catch (error) {
      console.log("Request failed:", error);
    }
  };

  return (
    <Modal
      title="Create a Portfolio"
      description="Portfolio description"
      isOpen={portfoliomodal.isOpen}
      onclose={portfoliomodal.onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="portfolio_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio Name</FormLabel>
                <FormControl>
                  <Input placeholder="Portfolio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex pt-2 gap-2 items-center justify-end">
            <Button variant="outline">Cancel</Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
