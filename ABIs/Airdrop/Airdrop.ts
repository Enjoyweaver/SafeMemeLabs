export const AirdropABI = [
  {
    name: "Airdrop",
    inputs: [
      {
        name: "token_address",
        type: "address",
        indexed: true,
      },
      {
        name: "total",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "airdropToken",
    inputs: [
      {
        name: "token_address",
        type: "address",
      },
      {
        name: "recipients",
        type: "address[]",
      },
      {
        name: "amounts",
        type: "uint256[]",
      },
    ],
    outputs: [],
  },
] as const
