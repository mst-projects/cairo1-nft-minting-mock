import {
  useEffect,
  useState,
} from 'react';

import {
  Contract,
  InvokeFunctionResponse,
  shortString,
} from 'starknet';

import { erc721Abi } from '../abis/erc721abi';
import { useStoreBlock } from '../context/blockContext';
import { useStoreWallet } from '../context/walletContext';
import { TransactionStatus } from './TransactionStatus';

const contractAddress = "0x053e445549f9ccbb415531f39474ed5c696723f9233467e9033d9dafb5721b4a";

export default function InteractWithErc721() {
    // wallet context
    const providerSN = useStoreWallet(state => state.provider);
    const accountFromContext = useStoreWallet(state => state.account);

    // block context
    const blockFromContext = useStoreBlock(state => state.dataBlock);

    // Component context
    const [getName, setGetName] = useState<string>("default");
    const [value, setValue] = useState<number | null>(null);
    
   
    const [transactionHash, setTransactionHash] = useState<string>("");

    const erc721Contract = new Contract(erc721Abi, contractAddress, providerSN);
    if (accountFromContext) { erc721Contract.connect(accountFromContext); }

    useEffect(() => {
      accountFromContext && erc721Contract.get_name()
            .then((resp: bigint) => {
                console.log("resp =", resp)
                setGetName(shortString.decodeShortString(resp.toString()));
            })
            .catch((e: any) => { console.log("error get_name =", e) });
        return () => { }
    }
        , [blockFromContext.blockNumber, accountFromContext]); // balance updated at each block

    function mint() {
        erc721Contract.mint(accountFromContext?.address, value)
            .then((resp: InvokeFunctionResponse) => {
                console.log("mint txH =", resp.transaction_hash)
                setTransactionHash(resp.transaction_hash);
            })
            .catch((e: any) => { console.log("error mint =", e) });
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value, 10);
        if (!isNaN(newValue)) {
            setValue(newValue);
        } else {
            setValue(null);
        }
    };

    return (
        <>
            {
                !getName ? ( 
                        "loading..."
                    
                ) : (
                      <div className="flex flex-col items-center bg-cyan-500">
                        <div className="text-center text-white py-2">
                          Token Name: {getName}
                        </div>

                        <div className="text-center">
                          <input type="number" onChange={handleInputChange} />
                          <p>{value !== null ? `Entered value: ${value}` : 'Please enter a number for tokenId'}</p>
                        </div>
                                <button
                                    className="
                                    max-w-md
                                    bg-[#fe4a3c]
                                    hover:bg-blue-700
                                    text-white
                                      py-2 
                                      px-4 
                                      rounded-lg"  
                                    onClick={() => {
                                        mint();
                                    }}
                                >
                                    mint
                                </button>
    
                            {!!transactionHash && (
                            <div className="">Last transaction status :
                                <TransactionStatus transactionHash={transactionHash}></TransactionStatus>
                            </div>
                        )
                        }
                        </div>

                )
            }
        </>
    )
}
