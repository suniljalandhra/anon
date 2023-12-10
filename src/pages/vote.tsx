/* eslint-disable react/no-unescaped-entities */
import { useAnonAadhaar } from "anon-aadhaar-react";
import { AnonAadhaarPCD, exportCallDataGroth16FromPCD } from "anon-aadhaar-pcd";
import { useEffect, useState, SetStateAction, Dispatch } from "react";
import { Ratings } from "@/components/Ratings";
import { Stepper } from "@/components/Stepper";
import { Loader } from "@/components/Loader";
import { useRouter } from "next/router";
import { useAccount, useContractWrite } from "wagmi";
import cryptoAidABI from "../../public/CryptoAid.json"; 
import { UserStatus } from "@/interface";
import { Web3NetworkSwitch, Web3Button } from "@web3modal/react";
import { ethers } from "ethers";
import banner from "../../public/form-image.png";
import Image from "next/image";
import React from "react";

type VoteProps = {
  setUserStatus: Dispatch<SetStateAction<UserStatus>>;
};

export default function Vote({ setUserStatus }: VoteProps) {
  // Use the Country Identity hook to get the status of the user.
  // State for storing the loss amount
  const [loss, setLoss] = useState();
  const [anonAadhaar] = useAnonAadhaar();
  const [voted, setVoted] = useState(false);
  const [pcd, setPcd] = useState<AnonAadhaarPCD>();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [rating, setRating] = useState<string>();

  const {data , isLoading, isSuccess, write} = useContractWrite({
    address: `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""}`,
    abi: cryptoAidABI.abi,
    functionName: "verifyAndRequest",
  });

  const sendRequest = async (fundId: any, loss: any, _pcd: AnonAadhaarPCD) => {
    const lossU256 = ethers.parseEther(loss);
    const { a, b, c, Input } = await exportCallDataGroth16FromPCD(_pcd);
    console.log('Verify Input at write', a, b, c, Input)
    write({
      args: [a, b, c, Input, fundId, lossU256],
    });
  }


  const sendVote = async (rating: string, _pcd: AnonAadhaarPCD) => {
    const { a, b, c, Input } = await exportCallDataGroth16FromPCD(_pcd);
    write({
      args: [rating, a, b, c, Input],
    });
  };

  const handleLossChange = (event: any) => {
    setLoss(event.target.value);
  };

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") setPcd(anonAadhaar.pcd);
  }, [anonAadhaar]);

  useEffect(() => {
    isConnected
      ? setUserStatus(UserStatus.WALLET_CONNECTED)
      : setUserStatus(UserStatus.WALLET_NOT_CONNECTED);
  }, [isConnected, setUserStatus]);

  return (
    <div className="flex flex-row gap-20 justify-center">
    <div>
      <main className="flex border-2 border-gray-400 flex-col min-h-[75vh] rounded-2xl w-full sm:max-w-screen-sm p-2 sm:p-8 justify-between" style={{height:'600px'}}>
        <h1 className="font-bold flex justify-center text-sm sm:text-3xl">
          User Verification Form
        </h1>

              <div className="flex w-full place-content-center gap-8">
                <Web3Button />
                {isConnected && <Web3NetworkSwitch />}
              </div>
              <div className="flex justify-center">
                <label>
                  Loss Amount:
                  <input
                    className="rounded-md ml-2 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    type="number"
                    value={loss}
                    onChange={handleLossChange}
                  />
                </label>
              </div>
              {isConnected ? (
                isSuccess ? (
                  <>
                    <button
                      disabled={true}
                      type="button"
                      className="rounded-md flex justify-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                    >
                      Entry Sent ✅
                    </button>
                    <div className="font-bold flex justify-center">
                      You can check your transaction{" "}
                      <a
                        href={`https://sepolia.scrollscan.com/tx//${data?.hash}`}
                        target="_blank"
                        className="text-blue-500"
                      >
                        here
                      </a>
                    </div>
                  </>
                ) : isLoading ? (
                  <Loader />
                ) : (
                  <button
                    disabled={loss === undefined || pcd === undefined}
                    type="button"
                    className="rounded-md bg-white flex justify-center  px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      if (loss !== undefined && pcd !== undefined) {
                        try {
                          sendRequest(0, loss, pcd);
                        } catch (error) {
                          console.log(error);
                        }
                      }
                    }}
                  >
                    Submit Request
                  </button>
                )
              ) : (
                <button
                  disabled={true}
                  type="button"
                  className="rounded-md bg-white px-1 py-2 flex justify-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                >
                  You need to connect your wallet first
                </button>
              )}

        <Stepper
          step={2}
          onPrevClick={() => {
            router.push("/");
          }}
        />
      </main>
      </div>
      <div className="flex justify-center">
      <Image 
        src={banner}
        alt="Picture of the author"
        className="rounded-2xl"
        width={600}
        height={100}
      />
    </div>
    </div>
  );
}
