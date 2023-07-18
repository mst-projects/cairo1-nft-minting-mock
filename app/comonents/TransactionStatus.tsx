import { useEffect, useState } from 'react'

import { GetTransactionReceiptResponse } from 'starknet'

import { useStoreBlock } from '../context/blockContext'
import { useStoreWallet } from '../context/walletContext'

type Props = { transactionHash: string }

export function TransactionStatus({ transactionHash }: Props) {
  // wallet context
  const providerSN = useStoreWallet((state) => state.provider)

  // block context
  const blockFromContext = useStoreBlock((state) => state.dataBlock)

  // component context
  const [txStatus, setTxStatus] = useState<string>('')

  useEffect(() => {
    providerSN
      ?.getTransactionReceipt(transactionHash)
      .then((resp: GetTransactionReceiptResponse) => {
        console.log('TxStatus =', resp.status)
        setTxStatus(resp.status ?? '')
      })
      .catch((e: any) => {
        console.log('error getTransactionStatus=', e)
      })
    return () => {}
  }, [blockFromContext.blockNumber])

  return (
    <>
      <div className="">Transaction is : {txStatus}</div>
    </>
  )
}
