import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // 1. Import Poppins
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Sidebar from "@/components/Sidebar";

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
        <ConvexClientProvider>
          <Sidebar />
          {/* avoid content being overlapped by the fixed Sidebar on md+ screens */}
          <div className="min-h-screen md:pl-48">{children}</div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
