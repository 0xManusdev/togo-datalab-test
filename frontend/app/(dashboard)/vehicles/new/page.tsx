"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCreateVehicle } from "@/hooks/useVehicles";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z.object({
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  licensePlate: z.string().min(1, "La plaque d'immatriculation est requise"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewVehiclePage() {
  const router = useRouter();
  const createVehicle = useCreateVehicle();
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await createVehicle.mutateAsync({
        ...data,
        image,
      });
      toast.success("Véhicule ajouté avec succès");
      router.push("/vehicles");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vehicles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ajouter un véhicule</h1>
          <p className="text-muted-foreground">
            Ajoutez un nouveau véhicule au parc
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du véhicule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  placeholder="Toyota"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-sm text-destructive">
                    {errors.brand.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  placeholder="Corolla 2023"
                  {...register("model")}
                />
                {errors.model && (
                  <p className="text-sm text-destructive">
                    {errors.model.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plaque d'immatriculation</Label>
              <Input
                id="licensePlate"
                placeholder="TG-1234-AB"
                {...register("licensePlate")}
              />
              {errors.licensePlate && (
                <p className="text-sm text-destructive">
                  {errors.licensePlate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Image du véhicule (optionnel)</Label>
              <ImageUpload
                value={image}
                onChange={setImage}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/vehicles">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ajouter le véhicule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
