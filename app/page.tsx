import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Kurmi Madharchod</h1>
      <Button>Clerk Button</Button>
    </div>
  );
}
