import { useEffect, useState } from "react";
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function useMainContract() {
    const client = useTonClient();
    const { sender, accountAddress } = useTonConnect();

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
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [prevGameCount, setPrevGameCount] = useState<null | number>(null);

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new MainContract(
            Address.parse("EQBtzzcwQbBH8jIDbINs-rjwe0jFIXcFjTN14TPu8hEaiYLP")
        );
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        let isSubscribed = true; // Flag to avoid setting state if the component is unmounted

        async function getValue() {
            if (!mainContract) return;

            const val = await mainContract.getData();
            const { balance } = await mainContract.getBalance();

            if (!isSubscribed) return; // Avoid setting state if unmounted

            setContractData({
                counter_value: val.number,
                last_result: val.last_result,
                last_sender: val.last_sender,
                owner_address: val.owner_address,
            });

            if (balance !== undefined) {
                setBalance(balance);
            }

            // Check if sender is the owner
            if (accountAddress) {
                const addressObject = Address.parse(accountAddress);
                const ownerAddressObject = val.owner_address;
                setIsOwner(
                    addressObject.toString() === ownerAddressObject.toString()
                );
            } else {
                setIsOwner(false);
            }

            // Logic for determining if the user is a winner
            if (prevGameCount !== null && val.number > prevGameCount) {
                if (accountAddress) {
                    const addressObject = Address.parse(accountAddress);
                    if (
                        val.last_sender.toString() === addressObject.toString()
                    ) {
                        setIsWinner(val.last_result === 1);
                    } else {
                        setIsWinner(undefined);
                    }
                }
            } else {
                setIsWinner(undefined);
            }

            setPrevGameCount(val.number);

            await sleep(500);
            getValue();
        }

        getValue();

        return () => {
            isSubscribed = false; // Clean up on unmount
        };
    }, [mainContract, sender, accountAddress, prevGameCount]); // Ensure to include accountAddress in the dependency array

    return {
        owner_address: contractData?.owner_address.toString(),
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        isWinner,
        isOwner, // Added isOwner to the returned object
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
                toNano(amount) // Correctly use amount
            );
        },
    };
}
