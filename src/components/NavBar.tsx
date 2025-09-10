"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  if (pathname === "/upload" || pathname === "/thankyou") return null;
  return (
    <div className="w-full flex justify-start">
      <Link href={"/"}>
        <div className={`m-8 ${pathname === "/" ? "font-bold" : ""}`}>MARCH</div>
      </Link>
      <Link href={"/dashboard"}>
        <div className={`m-8 ${pathname === "/dashboard" ? "font-bold" : ""}`}>
          Public Voting
        </div>
      </Link>
    </div>
  );
}
