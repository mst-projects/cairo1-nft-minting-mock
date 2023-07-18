'use client'
import { Suspense, useState } from 'react'

import { connect, StarknetWindowObject } from 'get-wallet-starknet'
import { encode } from 'starknet'

import InteractWithErc721 from './comonents/InteractWithErc721'
import { useStoreWallet } from './context/walletContext'
import Loading from './loading'

export default function Home() {
  const [isConnected, setConnected] = useState(false)
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null)

  const setAddressAccount = useStoreWallet((state) => state.setAddressAccount)

  const setChain = useStoreWallet((state) => state.setChain)
  const setAccount = useStoreWallet((state) => state.setAccount)
  const setProvider = useStoreWallet((state) => state.setProvider)

  const handleConnectClick = async () => {
    const wallet = await connect({ modalMode: 'alwaysAsk' })
    await wallet?.enable({ starknetVersion: 'v5' } as any)
    setWallet(wallet)
    const addr = encode.addHexPrefix(
      encode.removeHexPrefix(wallet?.selectedAddress ?? '0x').padStart(64, '0'),
    )
    setAddressAccount(addr)
    setConnected(!!wallet?.isConnected)
    if (wallet?.account) {
      setAccount(wallet.account)
    }
    if (wallet?.isConnected) {
      setChain(wallet.chainId) // not provided by Braavos
      setProvider(wallet.provider)
    }
  }
  return (
    <main className="flex min-h-screen flex-col justify-start bg-gray-900 p-4 text-white">
      <div className="mb-6 flex flex-row justify-between rounded-lg bg-gray-800 pt-2 shadow-md">
        <div className="text-lg font-semibold">
          Sango! Record the words of your choice.
        </div>
        <div>
          {!isConnected ? (
            <button
              className="rounded-lg bg-[#fe4a3c] px-4 py-2 text-white shadow-md transition-colors duration-300 hover:bg-orange-500"
              onClick={() => {
                handleConnectClick()
              }}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              className="rounded-lg bg-[#fe4a3c] px-4 py-2 text-white shadow-md transition-colors duration-300 hover:bg-orange-500"
              onClick={() => {
                setConnected(false)
              }}
            >
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>
      <div>
        <Suspense fallback={<Loading />}>
          <InteractWithErc721 />
        </Suspense>
      </div>
    </main>
  )
}
