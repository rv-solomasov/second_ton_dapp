import { useEffect, useState } from "react";
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function useMainContract() {
    const client = useTonClient();
    const { sender } = useTonConnect();

    const sleep = (time: number) =>
        new Promise((resolve) => setTimeout(resolve, time));

    const [contractData, setContractData] = useState<null | {
        counter_value: number;
        last_result: number; // 1 for win, 0 for loss
        last_sender: Address;
        owner_address: Address;
    }>();

    const [balance, setBalance] = useState<null | number>(null);
    const [isWinner, setIsWinner] = useState<undefined | boolean>(undefined);
    const [prevGameCount, setPrevGameCount] = useState<null | number>(null);

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new MainContract(
            Address.parse("EQD2IQP0cnvRzfDDFj4kn50BfJRZtnjWBvkG5T-bGgTIQb1o")
        );
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!mainContract) return;

            const val = await mainContract.getData();
            const { balance } = await mainContract.getBalance();

            // Update contract data without resetting
            setContractData({
                counter_value: val.number,
                last_result: val.last_result,
                last_sender: val.last_sender,
                owner_address: val.owner_address,
            });

            // Only update balance if fetched successfully
            if (balance !== undefined) {
                setBalance(balance);
            }

            // Check if a new game has been played
            if (prevGameCount !== null && val.number > prevGameCount) {
                // Determine if the current user is the winner
                if (val.last_sender.toString() === sender?.toString()) {
                    setIsWinner(val.last_result === 1);
                } else {
                    setIsWinner(undefined); // Reset isWinner if the sender is not the current user
                }
            } else {
                // Reset isWinner to undefined if nothing has changed
                setIsWinner(undefined);
            }

            // Update previous game count
            setPrevGameCount(val.number);

            // Recursively fetch values with a delay
            await sleep(500); // sleep 0.5 seconds before running again
            getValue();
        }

        getValue();
    }, [mainContract, sender, prevGameCount]);

    return {
        owner_address: contractData?.owner_address.toString(),
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        isWinner,
        ...contractData,
        betOnHeads: async (amount: string) => {
            return mainContract?.sendGame(sender, toNano(amount), 0);
        },
        betOnTails: async (amount: string) => {
            return mainContract?.sendGame(sender, toNano(amount), 1);
        },
        sendDeposit: async (amount: string) => {
            return mainContract?.sendDeposit(sender, toNano(amount));
        },
        sendWithdrawalRequest: async (amount: string) => {
            return mainContract?.sendWithdrawalRequest(
                sender,
                toNano("0.05"),
                toNano(toNano(amount))
            );
        },
    };
}
