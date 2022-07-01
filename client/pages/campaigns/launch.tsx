import type { NextPage } from 'next'
import Head from 'next/head'
import { useWeb3Contract } from "react-moralis"
import { factoryAbi, crowdfundAbi, contractAddresses } from "../../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { BigNumber, ethers } from "ethers"
import { useNotification } from "web3uikit"

interface contractAddressesInterface {
  [key: string]: string[]
}

const Launch: NextPage = () => {
  const addresses: contractAddressesInterface = contractAddresses
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId: string = parseInt(chainIdHex!).toString()
  const factoryAddress = chainId in addresses ? addresses[chainId][0] : null
  const [crowdfundAddress, setCrowdfundAddress] = useState([]);


  const dispatch = useNotification();

  const {
    data,
    runContractFunction: createCrowdfund,
    isLoading,
    isFetching,
} = useWeb3Contract({
    abi: factoryAbi,
    contractAddress: factoryAddress!, // specify the networkId
    functionName: "createCrowdfund",
    params: {},
    msgValue: '',
})

  async function updateUI() {

    const d: []= data as [] || [];
    setCrowdfundAddress(d);
}

useEffect(() => {
  console.log('ADDR ',factoryAddress)
  console.log('chainid:: ',chainId)
    if (isWeb3Enabled) {
        updateUI()
    }
}, [isWeb3Enabled])

const handleSuccess = async function () {
  handleNewNotification()
  updateUI()
}

const handleNewNotification = function () {
  dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
  })
}
  return (
    <>
      <Head>
        <title>Launch campaing</title>
        <meta name="description" content="Decentralized crowdfunding smart contract" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-5">
            Hi from factory creation!
            {factoryAddress ? (
                <div className="">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await createCrowdfund({
                                onSuccess: handleSuccess,
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>
                             create
                            </div>
                        )}
                    </button>
                    {<pre>{JSON.stringify(crowdfundAddress)}</pre>}
                </div>
            ) : (
                <div>No Factory Address Deteched</div>
            )}
        </div>
    </>
  )
}

export default Launch
