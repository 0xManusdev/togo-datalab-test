import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const poppins = Poppins({
	subsets: ["latin"],
	variable: "--font-poppins",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

const bricolage_grotesque = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--font-bricolage-grotesque",
});

export const metadata: Metadata = {
	title: "Carrent - Réservation de Véhicules",
	description: "Application de réservation de véhicules.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<body className={`${poppins.variable} ${bricolage_grotesque.variable} font-sans mx-auto antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
