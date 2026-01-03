"use client";

import React from "react";
import { motion } from "motion/react";

function cn(...classes: Array<string | null | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type LampContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function LampContainer({ children, className }: LampContainerProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[18rem] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950",
        className
      )}
    >
      <div className="relative z-0 flex w-full flex-1 scale-y-125 items-center justify-center">
        <motion.div
          initial={{ opacity: 0.5, width: "12rem" }}
          whileInView={{ opacity: 1, width: "22rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          style={{ backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))` }}
          className="absolute inset-auto right-1/2 h-48 w-[22rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute bottom-0 left-0 h-32 w-full bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 h-full w-32 bg-slate-950 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0.5, width: "12rem" }}
          whileInView={{ opacity: 1, width: "22rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          style={{ backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))` }}
          className="absolute inset-auto left-1/2 h-48 w-[22rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute bottom-0 right-0 h-full w-32 bg-slate-950 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 h-32 w-full bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        <div className="absolute top-1/2 h-40 w-full translate-y-10 scale-x-150 bg-slate-950 blur-2xl" />
        <div className="absolute top-1/2 z-50 h-40 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <div className="absolute inset-auto z-50 h-28 w-[20rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl" />
        <motion.div
          initial={{ width: "6rem" }}
          whileInView={{ width: "14rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-30 h-28 w-52 -translate-y-[5rem] rounded-full bg-cyan-400 blur-2xl"
        />
        <motion.div
          initial={{ width: "12rem" }}
          whileInView={{ width: "22rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-50 h-0.5 w-[22rem] -translate-y-[6rem] bg-cyan-400"
        />
        <div className="absolute inset-auto z-40 h-36 w-full -translate-y-[10rem] bg-slate-950" />
      </div>

      <div className="relative z-50 flex -translate-y-16 flex-col items-center px-4 py-6 text-center text-slate-50">
        {children}
      </div>
    </div>
  );
}
