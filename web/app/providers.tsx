"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "@mysten/dapp-kit/dist/index.css";

import { Toaster } from "react-hot-toast";

const { networkConfig } = createNetworkConfig({
	testnet: { url: getFullnodeUrl("testnet") },
	mainnet: { url: getFullnodeUrl("mainnet") },
});

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
				<WalletProvider autoConnect={true}>
					{children}
					<Toaster position="bottom-right" />
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
}
