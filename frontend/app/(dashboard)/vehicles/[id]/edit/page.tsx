"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { useVehicle, useUpdateVehicle } from "@/hooks/useVehicles";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z.object({
  brand: z.string().min(1, "La marque est requise").optional(),
  model: z.string().min(1, "Le modèle est requis").optional(),
  licensePlate: z.string().min(1, "La plaque est requise").optional(),
  isAvailable: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useVehicle(id);
  const updateVehicle = useUpdateVehicle();
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | string | null>(null);

  const vehicle = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        brand: vehicle.brand,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate,
        isAvailable: vehicle.isAvailable,
      });
      if (vehicle.imageUrl) {
        setImage(vehicle.imageUrl);
      }
    }
  }, [vehicle, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await updateVehicle.mutateAsync({
        id,
        data: {
          ...data,
          image: image instanceof File ? image : null,
        },
      });
      toast.success("Véhicule modifié avec succès");
      router.push(`/vehicles/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-medium">Véhicule non trouvé</h3>
        <Link href="/vehicles">
          <Button variant="link">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/vehicles/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Modifier le véhicule</h1>
          <p className="text-muted-foreground">
            {vehicle.brand} {vehicle.model}
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
                <Input id="brand" {...register("brand")} />
                {errors.brand && (
                  <p className="text-sm text-destructive">
                    {errors.brand.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input id="model" {...register("model")} />
                {errors.model && (
                  <p className="text-sm text-destructive">
                    {errors.model.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plaque d'immatriculation</Label>
              <Input id="licensePlate" {...register("licensePlate")} />
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
                onChange={(file) => setImage(file)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                className="h-4 w-4 rounded border-input"
                {...register("isAvailable")}
              />
              <Label htmlFor="isAvailable">Véhicule disponible</Label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href={`/vehicles/${id}`}>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
