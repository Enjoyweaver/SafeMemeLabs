export const CustomAirdropABI = [
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
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [],
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
    name: "airdropToken",
    inputs: [
      {
        name: "token_address",
        type: "address",
      },
      {
        name: "list_id",
        type: "uint256",
      },
      {
        name: "amounts",
        type: "uint256[]",
      },
    ],
    outputs: [],
  },
] as const
