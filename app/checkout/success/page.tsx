"use client";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Truck, Mail } from "lucide-react";

export default function SuccessPage() {
  useEffect(() => {
    const fire = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 80,
        spread: 80,
        startVelocity: 40,
        origin,
        colors: ["#E63946", "#F4D03F", "#F39C12", "#7CB342"],
      });
    fire({ x: 0.2, y: 0.4 });
    setTimeout(() => fire({ x: 0.8, y: 0.4 }), 250);
    setTimeout(() => fire({ x: 0.5, y: 0.35 }), 500);
  }, []);

  return (
    <div className="mx-auto grid max-w-2xl place-items-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-rype-leaf text-white"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>
      <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight">Order confirmed!</h1>
      <p className="mt-3 max-w-md text-rype-mute">
        Thank you. Your produce is being hand-picked right now and will arrive at your door within 24 hours.
      </p>

      <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<Mail className="h-4 w-4" />}
          title="Receipt on its way"
          desc="We've emailed your confirmation and tracking link."
        />
        <InfoCard
          icon={<Truck className="h-4 w-4" />}
          title="Arriving tomorrow"
          desc="Cold-chain shipped. You'll get a notification when the driver is near."
        />
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/products" className="btn-primary">Shop more</Link>
        <Link href="/" className="btn-outline">Back home</Link>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5 text-left">
      <div className="flex items-center gap-2 text-rype-leafDark">{icon}<span className="text-xs font-semibold uppercase tracking-wider">{title}</span></div>
      <p className="mt-2 text-sm text-rype-ink/80">{desc}</p>
    </div>
  );
}
