import { Suspense, useState } from 'react'

import { Contract, InvokeFunctionResponse, shortString } from 'starknet'

import { contractAddress } from '@/constants'

import { erc721Abi } from '../abis/erc721abi'
import { useStoreBlock } from '../context/blockContext'
import { useStoreWallet } from '../context/walletContext'
import Loading from '../loading'
import { TransactionStatus } from './TransactionStatus'

export default function InteractWithErc721() {
  // wallet context
  const providerSN = useStoreWallet((state) => state.provider)
  const accountFromContext = useStoreWallet((state) => state.account)

  // block context
  const blockFromContext = useStoreBlock((state) => state.dataBlock)

  // Component context
  const [nftName, setNftName] = useState<string>('')
  const [nftSymbol, setNftSymbol] = useState<string>('')
  const [tokenIdValue, setTokenIdValue] = useState<number | null>(null)
  const [tokenUriValue, setTokenUriValue] = useState<any>('')

  const [transactionHash, setTransactionHash] = useState<string>('')
  const [lastCalledFunction, setLastCalledFunction] = useState<string>('')

  const erc721Contract = new Contract(erc721Abi, contractAddress, providerSN)
  if (accountFromContext) {
    erc721Contract.connect(accountFromContext)
  }

  // to fetch the name of the NFT from the contract
  function fetchNameAndSymbolOfNft() {
    erc721Contract
      .get_name()
      .then((resp: bigint) => {
        console.log('resp =', resp)
        setNftName(shortString.decodeShortString(resp.toString()))
      })
      .catch((e: any) => {
        console.log('error get_symbol =', e)
      })

    erc721Contract
      .get_symbol()
      .then((resp: bigint) => {
        console.log('resp =', resp)
        setNftSymbol(shortString.decodeShortString(resp.toString()))
      })
      .catch((e: any) => {
        console.log('error get_symbol =', e)
      })
  }

  function mint() {
    erc721Contract
      .mint(accountFromContext?.address, tokenIdValue)
      .then((resp: InvokeFunctionResponse) => {
        console.log('mint txH =', resp.transaction_hash)
        setTransactionHash(resp.transaction_hash)
        setLastCalledFunction('mint')
      })
      .catch((e: any) => {
        console.log('error mint =', e)
      })
  }

  function setTokenUri() {
    erc721Contract
      .set_token_uri(tokenIdValue, tokenUriValue)
      .then((resp: InvokeFunctionResponse) => {
        console.log('set uri txH =', resp.transaction_hash)
        setTransactionHash(resp.transaction_hash)
        setLastCalledFunction('set_token_uri')
      })
      .catch((e: any) => {
        console.log('error set uri =', e)
      })
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTokenIdValue = parseInt(event.target.value, 10)
    if (!isNaN(newTokenIdValue)) {
      setTokenIdValue(newTokenIdValue)
    } else {
      setTokenIdValue(null)
    }
  }

  const handleTokenUriInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTokenUriValue = event.target.value

    if (newTokenUriValue != '' && newTokenUriValue.length <= 31) {
      const encStr = shortString.encodeShortString(newTokenUriValue)
      const encStrInBigInt = BigInt(encStr)
      console.log('encStrInBigInt =', encStrInBigInt)
      setTokenUriValue(encStrInBigInt)
    } else {
      setTokenUriValue('')
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      {!accountFromContext && (
        <div className="pt-8 text-xl">Connect Wallet to start</div>
      )}
      {accountFromContext && (
        <div className="pb-2 pt-4">
          <button
            className="max-w-md rounded-lg bg-gray-500 px-4 py-2  text-white hover:bg-gray-400"
            onClick={() => {
              fetchNameAndSymbolOfNft()
            }}
          >
            Show name and symbol of the NFT
          </button>
        </div>
      )}
      {nftName && nftSymbol && (
        <div className="py-2 text-center text-white">
          Token Name: {nftName}
          <br />
          Token Symbol {nftSymbol}
        </div>
      )}

      {accountFromContext && (
        <div className="w-full pt-8 text-center">
          <div>
            <p className="pt-4 text-gray-300">Choose a token id</p>
            <input
              className="focus:shadow-outline-blue mt-4 w-1/2 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:outline-none"
              type="number"
              min="1"
              placeholder="put an number e.g,1 "
              onChange={handleInputChange}
            />
          </div>
          <div className="pt-4 text-center">
            <button
              className="max-w-md rounded-lg bg-[#fe4a3c] px-4 py-2  text-white hover:bg-orange-500"
              onClick={() => {
                mint()
              }}
            >
              Mint
            </button>
          </div>
          <p className="w-full pt-6 text-center text-gray-300">
            Choose three words you like
          </p>
          <input
            className="focus:shadow-outline-blue my-2 mt-4 w-1/2 rounded-md px-3 py-2 pt-4 text-center text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:outline-none"
            type="text"
            placeholder="Write three words you like (less than 31 alpabets)."
            onChange={handleTokenUriInputChange}
          />
          <div className="pt-4 text-center">
            <button
              className="max-w-md rounded-lg bg-[#fe4a3c] px-4 py-2  text-white hover:bg-orange-500"
              onClick={() => {
                setTokenUri()
              }}
            >
              Set Token URI
            </button>
            <p className="pt-4 text-sm">
              Note: When you set token URI, you need to set the token ID above
              same as the token ID you minted.
            </p>
          </div>
        </div>
      )}

      {!!transactionHash && (
        <div className="pt-4">
          Last called function:
          <span className="font-bold">{lastCalledFunction}</span> <br />
          Last transaction status :
          <Suspense fallback={<Loading />}>
            <TransactionStatus
              transactionHash={transactionHash}
            ></TransactionStatus>
            Transaction Hash: {transactionHash}
          </Suspense>
        </div>
      )}
    </div>
  )
}
