"use client";
import { useState } from 'react';

import {
  connect,
  StarknetWindowObject,
} from 'get-wallet-starknet';
import { encode } from 'starknet';

import InteractWithErc721 from './comonents/InteractWithErc721';
import { useStoreWallet } from './context/walletContext';

export default function Home() {
  const [isConnected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);
  const addressAccountFromContext = useStoreWallet(state => state.address);
  const setAddressAccount = useStoreWallet(state => state.setAddressAccount);
  const chainFromContext = useStoreWallet(state => state.chain);
  const setChain = useStoreWallet(state => state.setChain);
  const accountFromContext = useStoreWallet(state => state.account);
  const setAccount = useStoreWallet(state => state.setAccount);
  const providerFromContext = useStoreWallet(state => state.provider);
  const setProvider = useStoreWallet(state => state.setProvider);


  const handleConnectClick = async () => {
    const wallet = await connect({ modalMode: "alwaysAsk" });
    await wallet?.enable({ starknetVersion: "v5" } as any);
    setWallet(wallet);
    const addr = encode.addHexPrefix(encode.removeHexPrefix(wallet?.selectedAddress ?? "0x").padStart(64, "0"));
    setAddressAccount(addr);
    setConnected(!!wallet?.isConnected);
    if (wallet?.account) {
        setAccount(wallet.account);
    }
    if (wallet?.isConnected) {
        setChain(wallet.chainId); // not provided by Braavos
        setProvider(wallet.provider);
    }
}
  return (
    <main className="bg-[#28286e] flex min-h-screen flex-col justify-start">
      <div className="flex flex-row justify-between bg-blue-500 pt-2 pb-2 first-line:pr-6">
        <div className="text-justify bg-pink-500 p-2">Irodori NFT minting page</div>
        <div className="bg-blue-500">
        <button className="
         bg-[#fe4a3c]
         hover:bg-blue-700
         text-white
           py-2 
           px-4 
           rounded-lg" 
            onClick={() => {
              handleConnectClick();
            }}
            >
            Connect Wallet
        </button>
      </div>
      </div>
      <div className="flex flex-col align-center pt-6">
      <p className="text-center bg-yellow-700">
        address = {addressAccountFromContext}<br />
        chain = {chainFromContext}<br />
        isConnected={isConnected ? "Yes" : "No"}<br />
        account.address ={accountFromContext?.address}
      </p>
å
      </div>
      <div>
        <InteractWithErc721 />
      </div>
      
    </main>
  )
}
