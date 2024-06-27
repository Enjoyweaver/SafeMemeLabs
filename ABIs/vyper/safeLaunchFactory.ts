export const safeLaunchFactoryABI = [
  {
    type: "event",
    name: "NewSafeLaunch",
    inputs: [
      {
        name: "safeLaunch",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "safeLaunch_template",
        type: "address",
      },
      {
        name: "token_factory",
        type: "address",
      },
      {
        name: "exchange_factory",
        type: "address",
      },
      {
        name: "creation_fee",
        type: "uint256",
      },
      {
        name: "fee_recipient",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "deploySafeLaunch",
    stateMutability: "payable",
    inputs: [
      {
        name: "safeMemeToken",
        type: "address",
      },
      {
        name: "exchangeToken",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "getSafeLaunchsDeployedByUser",
    stateMutability: "view",
    inputs: [
      {
        name: "_user",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
      },
    ],
  },
  {
    type: "function",
    name: "getDeployedSafeLaunchCount",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "safeLaunchTemplate",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "tokenFactoryAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "exchangeFactoryAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "safeLaunchsDeployed",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "safeLaunchOwners",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "userSafeLaunchList",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "creationFee",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "feeRecipient",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
]
