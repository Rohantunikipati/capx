import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalInterface {
  title: string;
  description: string;
  isOpen: boolean;
  onclose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalInterface> = ({ ...props }) => {
  const onChange = (open: boolean) => {
    if (!open) {
      props.onclose();
    }
  };

  return (
    <>
      <Dialog open={props.isOpen} onOpenChange={onChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>
          {props.children}
        </DialogContent>
      </Dialog>
    </>
  );
};
