"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";

import { useUpdateProfile } from "../hooks/use-update-profile";
import { updateProfileSchema } from "../validations/user.validation";
import { UpdateProfileType } from "../types/user.type";

type EditProfileDialogProps = {
  name: string;
  phone: string | null;
  children?: React.ReactNode;
};

export function EditProfileDialog({
  name,
  phone,
  children,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useUpdateProfile();

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name,
      phone: phone ?? "",
    },
  });

  async function onSubmit(values: UpdateProfileType) {
    await mutateAsync(values);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (value) {
          form.reset({ name, phone: phone ?? "" });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>

          <DialogDescription>
            Update your name and phone number.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <RHFInput<UpdateProfileType>
              name="name"
              label="Full Name"
              placeholder="John Doe"
              required
            />

            <RHFInput<UpdateProfileType>
              name="phone"
              label="Phone"
              placeholder="+91 XXXXX XXXXX"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
