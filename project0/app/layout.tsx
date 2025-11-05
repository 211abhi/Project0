import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // 1. Import Poppins
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

// 2. Configure the Poppins font
const poppins = Poppins({
  variable: "--font-poppins", // You can name the CSS variable anything
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Include the weights you need
});

export const metadata: Metadata = {
  title: "Project0 🍀",
  description: "Team fourth floor is on work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`} // 3. Apply the font variable to the body
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
