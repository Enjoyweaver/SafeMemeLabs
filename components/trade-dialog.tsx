"use client"

import { useState } from "react"
import Image from "next/image"
import {
  avaxConfig,
  proxyConfig,
  usdcConfig,
  wethConfig,
} from "@/Constants/contracts"
import { symbols } from "@/Constants/trade"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { Address, parseEther, parseUnits } from "viem"
import {
  useAccount,
  useBalance,
  useContractWrite,
  useSendTransaction,
} from "wagmi"
import * as z from "zod"

import { Pair, chainlinkPairToFeedId } from "@/types/_types"
import { Button } from "@/components/ui/button"
import { DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useDatafeed } from "@/app/(marketing)/datafeed-provider"

const formSchema = z.object({
  from: z.coerce.number().gt(0),
  to: z.coerce.number().gt(0),
})

const TradeDialog = ({ pair }: { pair: Pair }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<Address | undefined>()
  const { address } = useAccount()
  const { prices } = useDatafeed()
  const [tokenA, setTokenA] = useState<Address | undefined>(
    pair === Pair.AVAX_USD ? avaxConfig.address : wethConfig.address
  )
  const [tokenB, setTokenB] = useState<Address | undefined>(usdcConfig.address)
  const { data: tokenABalance } = useBalance({ address, token: tokenA })
  const { data: tokenBBalance } = useBalance({ address, token: tokenB })

  const [feedId, setFeedId] = useState(
    pair === Pair.AVAX_USD
      ? chainlinkPairToFeedId[Pair.AVAX_USD]
      : chainlinkPairToFeedId[Pair.ETH_USD]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: 0,
      to: 0,
    },
  })

  const fromAmount = form.watch("from")
  const { sendTransactionAsync: wrapEth } = useSendTransaction({
    onSuccess() {
      toast({
        title: `Wrapped ${fromAmount} ETH`,
      })
    },
  })

  const { writeAsync: approveWeth } = useContractWrite({
    ...wethConfig,
    functionName: "approve",
    onError(error) {
      toast({
        variant: "destructive",
        title: error.name,
        description: error.message,
      })
    },
    onSuccess() {
      toast({
        title: "Approve transaction has been sent",
      })
    },
  })

  const { writeAsync: approveAvax } = useContractWrite({
    ...avaxConfig,
    functionName: "approve",
    onError(error) {
      toast({
        variant: "destructive",
        title: error.name,
        description: error.message,
      })
    },
    onSuccess() {
      toast({
        title: "Approve transaction has been sent",
      })
    },
  })

  const { writeAsync: approveUsdc } = useContractWrite({
    ...usdcConfig,
    functionName: "approve",
    onError(error) {
      toast({
        variant: "destructive",
        title: error.name,
        description: error.message,
      })
    },
    onSuccess() {
      toast({
        title: "Approve transaction has been sent",
      })
    },
  })

  const { writeAsync: trade } = useContractWrite({
    ...proxyConfig,
    functionName: "trade",
    onError(error) {
      toast({
        variant: "destructive",
        title: error.name,
        description: error.message,
      })
    },
    onSuccess() {
      toast({
        title: "Swap in progress",
      })
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setFeedId(
      tokenA === wethConfig.address
        ? chainlinkPairToFeedId[Pair.ETH_USD]
        : chainlinkPairToFeedId[Pair.AVAX_USD]
    )
    const amountA = parseUnits(`${values.from}`, tokenABalance?.decimals ?? 0)
    const amountB = parseUnits(`${values.to}`, tokenBBalance?.decimals ?? 0)

    if (amountA > (tokenABalance?.value ?? BigInt(0))) {
      toast({
        title: "Error:",
        description: "Insufficient Balance",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (tokenA == wethConfig.address) {
      await wrapEth({
        to: wethConfig.address,
        value: fromAmount ? parseEther(`${fromAmount}`) : undefined,
      })
      await approveWeth({
        args: [proxyConfig.address, parseEther(`${fromAmount}`)],
      })
    }

    if (tokenA == avaxConfig.address) {
      await approveAvax({
        args: [proxyConfig.address, parseEther(`${fromAmount}`)],
      })
    }

    if (tokenA == usdcConfig.address) {
      await approveUsdc({
        args: [proxyConfig.address, parseEther(`${fromAmount}`)],
      })
    }

    const result = await trade({
      args: [tokenA!, tokenB!, parseEther(`${fromAmount}`), feedId],
    })
    toast({
      title: "Swap completed:",
      description: `${values.from} ${tokenABalance?.symbol} for ${values.to} ${tokenBBalance?.symbol}`,
      variant: "success",
    })
    setIsLoading(false)
    setTxHash(result.hash)
  }

  return txHash ? (
    <div className="flex h-96 flex-col items-center justify-center">
      <Check className="rounded-full bg-[#2FB96C] p-2" width={60} height={60} />
      <h3 className="my-3 text-xl font-medium">Swap completed!</h3>
      <a
        href={`https://goerli.arbiscan.io/tx/${txHash}`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center space-x-[8px] text-base font-bold leading-4 underline hover:brightness-125"
      >
        <span className="text-sm font-bold leading-4 text-white">
          View on Explorer
        </span>
        <Image
          src="/external-link.svg"
          width={12}
          height={12}
          alt="external-link"
        />
      </a>
    </div>
  ) : (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full grid-cols-2">
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-[450] leading-4">
                    From
                  </FormLabel>
                  <Input
                    type="number"
                    className="rounded-none border-0 p-0 text-[40px] font-medium leading-[52px] -tracking-[0.8px] [appearance:textfield] focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    {...field}
                    onChange={(e) => {
                      if (Number(e.target.value) < 0) {
                        return
                      }
                      form.setValue(
                        "to",
                        tokenA === usdcConfig.address
                          ? Math.round(
                              (Number(e.target.value) + Number.EPSILON) * 100
                            ) /
                              100 /
                              Number(prices[pair])
                          : Number(e.target.value) * Number(prices[pair])
                      )
                      field.onChange(e)
                    }}
                  />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-end space-y-4">
              <Label className="text-base font-[450] leading-4 text-muted-foreground">
                Balance:&nbsp;
                <span className="text-foreground">
                  {tokenABalance?.formatted}
                </span>
              </Label>
              <div className="flex items-center space-x-2 rounded-md bg-muted px-4 py-2">
                {tokenABalance?.symbol && (
                  <Image
                    src={symbols[tokenABalance?.symbol]}
                    height={24}
                    width={24}
                    alt={tokenABalance.symbol}
                  />
                )}
                <span className="text-base font-[450] leading-4">
                  {tokenABalance?.symbol}
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center space-x-6">
            <div className="h-[1px] flex-1 bg-border" />
          </div>
          <div className="grid w-full grid-cols-2">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-[450] leading-4">
                    To
                  </FormLabel>
                  <Input
                    type="number"
                    className="rounded-none border-0 p-0 text-[40px] font-medium leading-[52px] -tracking-[0.8px] [appearance:textfield] focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    {...field}
                    onChange={(e) => {
                      if (Number(e.target.value) < 0) {
                        return
                      }
                      form.setValue(
                        "from",
                        tokenA === usdcConfig.address
                          ? Number(e.target.value) * Number(prices[pair])
                          : Math.round(
                              (Number(e.target.value) + Number.EPSILON) * 100
                            ) /
                              100 /
                              Number(prices[pair])
                      )
                      field.onChange(e)
                    }}
                  />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-end space-y-4">
              <Label className="text-base font-[450] leading-4 text-muted-foreground">
                Balance:&nbsp;
                <span className="text-foreground">
                  {tokenBBalance?.formatted}
                </span>
              </Label>
              <div className="flex items-center space-x-2 rounded-md bg-muted px-4 py-2">
                {tokenBBalance?.symbol && (
                  <Image
                    src={symbols[tokenBBalance?.symbol]}
                    height={24}
                    width={24}
                    alt={tokenBBalance.symbol}
                  />
                )}
                <span className="text-base font-[450] leading-4">
                  {tokenBBalance?.symbol}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-[450] text-secondary-foreground">
            Note: swap values are approximate
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full bg-[#375BD2] text-base font-black leading-4 text-foreground hover:bg-[#375BD2]/90"
          >
            Swap
          </Button>
        </form>
      </Form>
      <DialogFooter>
        <DialogTrigger asChild>
          <Button className="w-full border-2 border-border bg-background text-base font-medium leading-4 text-foreground hover:bg-background/90 hover:text-muted-foreground">
            Cancel
          </Button>
        </DialogTrigger>
      </DialogFooter>
    </>
  )
}

export default TradeDialog
