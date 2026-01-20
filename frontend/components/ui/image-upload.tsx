"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	value?: File | string | null;
	onChange: (file: File | null) => void;
	disabled?: boolean;
	className?: string;
}

export function ImageUpload({
	value,
	onChange,
	disabled = false,
	className,
}: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(
		typeof value === "string" ? value : null
	);
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = useCallback(
		(file: File | null) => {
			if (file) {
				if (!file.type.startsWith("image/")) {
					alert("Veuillez sélectionner une image");
					return;
				}
				if (file.size > 5 * 1024 * 1024) {
					alert("L'image ne doit pas dépasser 5MB");
					return;
				}
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreview(reader.result as string);
				};
				reader.readAsDataURL(file);
				onChange(file);
			} else {
				setPreview(null);
				onChange(null);
			}
		},
		[onChange]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);
			if (disabled) return;

			const file = e.dataTransfer.files[0];
			if (file) {
				handleFile(file);
			}
		},
		[disabled, handleFile]
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			if (!disabled) {
				setIsDragging(true);
			}
		},
		[disabled]
	);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleClick = () => {
		if (!disabled) {
			inputRef.current?.click();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFile(file);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		handleFile(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	return (
		<div className={className}>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={handleInputChange}
				className="hidden"
				disabled={disabled}
			/>

			<div
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={cn(
					"relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-primary/50",
					disabled && "cursor-not-allowed opacity-50",
					preview && "border-solid"
				)}
			>
				{preview ? (
					<>
						<img
							src={preview}
							alt="Preview"
							className="max-h-[180px] rounded-md object-contain"
						/>
						{!disabled && (
							<Button
								type="button"
								variant="destructive"
								size="icon"
								className="absolute right-2 top-2"
								onClick={handleRemove}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</>
				) : (
					<>
						<div className="flex flex-col items-center gap-2 text-muted-foreground">
							<div className="rounded-full bg-muted p-3">
								<Upload className="h-6 w-6" />
							</div>
							<div className="text-center">
								<p className="text-sm font-medium">
									Cliquez ou glissez une image
								</p>
								<p className="text-xs">JPG, PNG ou WebP (max 5MB)</p>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
