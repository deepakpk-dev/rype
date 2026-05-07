import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <Image
        src="/logo.svg"
        alt="Rype"
        width={size}
        height={size}
        priority
        className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
      />
      <span className="font-display text-2xl font-semibold tracking-tight text-rype-ink">
        Rype
      </span>
    </Link>
  );
}
