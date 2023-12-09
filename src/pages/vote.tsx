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
  // const { data, isLoading, isSuccess, write } = useContractWrite({
  //   address: `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""}`,
  //   abi: voteABI.abi,
  //   functionName: "voteForProposal",
  // });

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
    console.log('Verify Input at write', a, b, c, Input)
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
    <>
      <main className="flex flex-col min-h-[75vh] mx-auto rounded-2xl w-full sm:max-w-screen-sm p-2 sm:p-8 justify-between">
        <h1 className="font-bold text-sm sm:text-2xl">
          Anon Aadhaar Example - Vote
        </h1>
        <div className="text-sm sm:text-lg">
          Next, you have the option to connect your wallet and cast your vote
          alongside your Anon Aadhaar proof. Your vote will be paired with your
          proof, and the smart contract will initially verify your proof before
          processing your vote.
        </div>
              <div>
                <label>
                  Loss Amount:
                  <input
                    type="number"
                    value={loss}
                    onChange={handleLossChange}
                  />
                </label>
              </div>
              <button
                    disabled={loss === undefined || pcd === undefined}
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      console.log("loss", loss);
                      console.log("pcd", pcd);
                      if (loss !== undefined && pcd !== undefined) {
                        try {
                          sendRequest(0, loss, pcd);
                        } catch (error) {
                          console.log(error);
                        }
                      }
                    }}
                  >
                    Vote
                  </button>
        <div className="flex w-full place-content-center gap-8">
          <Web3Button />
          {isConnected && <Web3NetworkSwitch />}
        </div>

        <div className="flex flex-col items-center gap-5">
          {voted ? (
            <>
              Thank you for casting your vote. Your participation is greatly
              appreciated.
            </>
          ) : (
            <>
              <div className="text-sm sm:text-lg font-medium">
                On a scale of 0 to 5, how likely are you to recommend this hack?
              </div>
              <Ratings setRating={setRating} />
              {isConnected ? (
                isSuccess ? (
                  <>
                    <button
                      disabled={true}
                      type="button"
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                    >
                      Vote sent ✅
                    </button>
                    <div className="font-bold">
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
                    disabled={rating === undefined || pcd === undefined}
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      console.log("rating", rating);
                      console.log("pcd", pcd);
                      if (rating !== undefined && pcd !== undefined) {
                        try {
                          sendVote(rating, pcd);
                        } catch (error) {
                          console.log(error);
                        }
                      }
                    }}
                  >
                    Vote
                  </button>
                )
              ) : (
                <button
                  disabled={true}
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                >
                  You need to connect your wallet first
                </button>
              )}
            </>
          )}
        </div>

        <Stepper
          step={2}
          onPrevClick={() => {
            router.push("/");
          }}
        />
      </main>
    </>
  );
}
