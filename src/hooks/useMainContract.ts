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
        last_result: number;
        owner_address: Address;
    }>();

    const [balance, setBalance] = useState<null | number>(null); // Initially set to null

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new MainContract(
            Address.parse("EQAzp15sRpuqs63RGZYak_5WATqF_yF026_OJ6qgnHTEu8O5") //"EQA9CfWV2bJDf5LwOLkcINyeK48RWjIr3BUzYenwA_CDhAym"
        );
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!mainContract) return;

            // Fetch contract data and balance

            const val = await mainContract.getData();
            const { balance } = await mainContract.getBalance();

            // Update contract data without resetting
            setContractData((prev) => ({
                ...prev,
                counter_value: val.number,
                last_result: val.last_result,
                last_sender: val.last_sender,
                owner_address: val.owner_address,
            }));

            // Only update balance if fetched successfully
            if (balance !== undefined) {
                setBalance(balance);
            }

            // Recursively fetch values with a delay
            await sleep(500); // sleep 0.5 seconds before running again
            getValue();
        }

        getValue();
    }, [mainContract]);

    return {
        owner_address: contractData?.owner_address.toString(),
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
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
