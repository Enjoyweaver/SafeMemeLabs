export const AirdropFactoryABI = [
  {
    name: "Airdrop",
    inputs: [
      {
        name: "safememe_address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "list_id",
        type: "uint256",
        indexed: true,
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "ListCreated",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
        indexed: true,
      },
      {
        name: "name",
        type: "string",
        indexed: false,
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "ListUpdated",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
        indexed: true,
      },
      {
        name: "name",
        type: "string",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "ListDeleted",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RecipientAdded",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
        indexed: true,
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RecipientRemoved",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
        indexed: true,
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewCustomAirdrop",
    inputs: [
      {
        name: "customAirdrop",
        type: "address",
        indexed: true,
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Transfer",
    inputs: [
      {
        name: "safememe_address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
      },
      {
        name: "to",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_safeMemeLabs",
        type: "address",
      },
      {
        name: "_airdropFactory",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "createList",
    inputs: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "recipients",
        type: "address[]",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getCustomAirdropsDeployedByUser",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "updateList",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
      },
      {
        name: "name",
        type: "string",
      },
      {
        name: "recipients",
        type: "address[]",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "deleteList",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "addRecipient",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "removeRecipient",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getList",
    inputs: [
      {
        name: "list_id",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "string",
      },
      {
        name: "",
        type: "address",
      },
      {
        name: "",
        type: "address[]",
      },
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getUserLists",
    inputs: [
      {
        name: "user",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
      },
    ],
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "airdropSafeMeme",
    inputs: [
      {
        name: "safememe_address",
        type: "address",
      },
      {
        name: "list_id",
        type: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "owner",
        type: "address",
      },
    ],
    outputs: [],
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
    name: "airdropFactory",
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
    name: "airdropUserCount",
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
    name: "airdropListRecipientCount",
    inputs: [
      {
        name: "arg0",
        type: "uint256",
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
    stateMutability: "view",
    type: "function",
    name: "tokenAirdropped",
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
    stateMutability: "view",
    type: "function",
    name: "safeMemeAirdropped",
    inputs: [
      {
        name: "arg0",
        type: "uint256",
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
    stateMutability: "view",
    type: "function",
    name: "uniqueUsers",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
] as const
