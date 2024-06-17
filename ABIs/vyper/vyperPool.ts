export const vyperPoolABI = [
  {
    inputs: [
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "address[]", name: "_coins", type: "address[]" },
      { internalType: "address", name: "_pool_token", type: "address" },
      { internalType: "uint256", name: "_A", type: "uint256" },
      { internalType: "uint256", name: "_fee", type: "uint256" },
      { internalType: "uint256", name: "_admin_fee", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "uint256[]", name: "_amounts", type: "uint256[]" },
      { internalType: "uint256", name: "_min_mint_amount", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "uint256[]", name: "_min_amounts", type: "uint256[]" },
    ],
    name: "remove_liquidity",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "int128", name: "i", type: "int128" },
      { internalType: "int128", name: "j", type: "int128" },
      { internalType: "uint256", name: "_dx", type: "uint256" },
      { internalType: "uint256", name: "_min_dy", type: "uint256" },
    ],
    name: "exchange",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_token_amount", type: "uint256" },
      { internalType: "int128", name: "i", type: "int128" },
      { internalType: "uint256", name: "_min_amount", type: "uint256" },
    ],
    name: "remove_liquidity_one_coin",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "get_virtual_price",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "int128", name: "i", type: "int128" },
      { internalType: "int128", name: "j", type: "int128" },
      { internalType: "uint256", name: "_dx", type: "uint256" },
    ],
    name: "get_dy",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]
