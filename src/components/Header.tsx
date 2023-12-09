import { FunctionComponent } from "react";
import Image from "next/image";
import imgGithub from "../../public/github-mark.png";
import imgPSE from "../../public/pse.png";
import { VoteResults } from "./VoteResults";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const Header: FunctionComponent = () => {
  return (
    <header className="">
      <div className="flex flex-row gap-3 items-center justify-end m-5">
        {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? (
          <a
            href={`https://sepolia.scrollscan.com/address/0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
            target={"_blank"}
            className="text-black font-light text-sm hover:underline "
          >
            {shortenAddress("0x" + process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)}
          </a>
        ) : null}
      </div>
    </header>
  );
};
