import { Suspense, useEffect, useState } from 'react'

import { Contract, InvokeFunctionResponse, shortString } from 'starknet'

import { erc721Abi } from '../abis/erc721abi'
import { useStoreBlock } from '../context/blockContext'
import { useStoreWallet } from '../context/walletContext'
import Loading from '../loading'
import { TransactionStatus } from './TransactionStatus'

const contractAddress =
  '0x053e445549f9ccbb415531f39474ed5c696723f9233467e9033d9dafb5721b4a'

export default function InteractWithErc721() {
  // wallet context
  const providerSN = useStoreWallet((state) => state.provider)
  const accountFromContext = useStoreWallet((state) => state.account)

  // block context
  const blockFromContext = useStoreBlock((state) => state.dataBlock)

  // Component context
  const [nftName, setNftName] = useState<string>('default')
  const [nftSymbol, setNftSymbol] = useState<string>('default')
  const [tokenIdValue, setTokenIdValue] = useState<number | null>(null)
  const [tokenUriValue, setTokenUriValue] = useState<string>('')

  const [transactionHash, setTransactionHash] = useState<string>('')

  const erc721Contract = new Contract(erc721Abi, contractAddress, providerSN)
  if (accountFromContext) {
    erc721Contract.connect(accountFromContext)
  }

  useEffect(() => {
    accountFromContext &&
      erc721Contract
        .get_name()
        .then((resp: bigint) => {
          console.log('resp =', resp)
          setNftName(shortString.decodeShortString(resp.toString()))
        })
        .catch((e: any) => {
          console.log('error get_name =', e)
        })
    accountFromContext &&
      erc721Contract
        .get_symbol()
        .then((resp: bigint) => {
          console.log('resp =', resp)
          setNftSymbol(shortString.decodeShortString(resp.toString()))
        })
        .catch((e: any) => {
          console.log('error get_symbol =', e)
        })
    return () => {}
  }, [blockFromContext.blockNumber, accountFromContext]) // balance updated at each block

  function mint() {
    erc721Contract
      .mint(accountFromContext?.address, tokenIdValue)
      .then((resp: InvokeFunctionResponse) => {
        console.log('mint txH =', resp.transaction_hash)
        setTransactionHash(resp.transaction_hash)
      })
      .catch((e: any) => {
        console.log('error mint =', e)
      })

    erc721Contract
      .set_uri(accountFromContext?.address, tokenIdValue, tokenUriValue)
      .then((resp: InvokeFunctionResponse) => {
        console.log('set uri txH =', resp.transaction_hash)
        setTransactionHash(resp.transaction_hash)
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
    if (newTokenUriValue != '') {
      setTokenUriValue(newTokenUriValue)
    } else {
      setTokenUriValue('')
    }
  }

  return (
    <>
      {
        <div className="flex flex-col items-center">
          <div className="py-2 text-center text-white">
            Token Name: {nftName}
          </div>
          <div className="py-2 text-center text-white">
            Token Symbol {nftSymbol}
          </div>

          <div className="pt-12 text-center">
            <p className="pb-4 text-orange-600">
              Choose a token id and mint an NFT for you!
            </p>
            <input
              className="focus:shadow-outline-blue w-full rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:outline-none"
              type="number"
              min="1"
              placeholder="put an number e.g,1 "
              onChange={handleTokenUriInputChange}
            />

            <input
              className="focus:shadow-outline-blue mt-4 w-full rounded-md px-3 py-2 pt-4 text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:outline-none"
              type="text"
              placeholder="put a text as a mock tokenUri"
              onChange={handleInputChange}
            />
          </div>
          <div className="pt-4">
            <button
              className="max-w-md rounded-lg bg-[#fe4a3c] px-4 py-2  text-white hover:bg-blue-700"
              onClick={() => {
                mint()
              }}
            >
              mint
            </button>
          </div>

          {!!transactionHash && (
            <div className="">
              Last transaction status :
              <Suspense fallback={<Loading />}>
                <TransactionStatus
                  transactionHash={transactionHash}
                ></TransactionStatus>
              </Suspense>
            </div>
          )}
        </div>
      }
    </>
  )
}
