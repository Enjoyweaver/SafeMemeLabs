export const houseFeeABI = [
  {
    name: "FeesCollected",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "contractCaller",
        type: "address",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "FeesWithdrawn",
    inputs: [
      {
        name: "amountWithdrawn",
        type: "uint256",
        indexed: false,
      },
      {
        name: "totalAccumulated",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "constructor",
    inputs: [
      {
        name: "house_fee",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "collectFees",
    inputs: [
      {
        name: "contractCaller",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getAccumulatedFees",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "withdrawFees",
    inputs: [],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "accumulatedHouseFees",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "safeMemeLabs",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
] as const
