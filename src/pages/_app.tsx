import React from "react";
import "../styles/tailwind_prelude.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
};

export default trpc.withTRPC(MyApp);
