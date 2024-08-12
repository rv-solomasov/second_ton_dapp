import { useTonConnectUI, toUserFriendlyAddress } from "@tonconnect/ui-react";
import { Sender, SenderArguments } from "@ton/core";

export function useTonConnect(): {
    sender: Sender;
    connected: boolean;
    accountAddress: string | null; // accountAddress will always be a string or null
} {
    const [tonConnectUI] = useTonConnectUI();

    // Get the user's address if connected
    const accountAddress =
        tonConnectUI.connected && tonConnectUI.account?.address
            ? toUserFriendlyAddress(tonConnectUI.account.address)
            : null;

    return {
        sender: {
            send: async (args: SenderArguments) => {
                tonConnectUI.sendTransaction({
                    messages: [
                        {
                            address: args.to.toString(),
                            amount: args.value.toString(),
                            payload: args.body?.toBoc().toString("base64"),
                        },
                    ],
                    validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes to approve
                });
            },
        },
        connected: tonConnectUI.connected,
        accountAddress, // accountAddress is never undefined
    };
}
