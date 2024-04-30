// Define fees and their conversions in native token units

const tokenDecimals = {
  FTM: 18, // Fantom token decimals
  Degen: 18, // Degen token decimals
  Matic: 18, // Polygon (Matic) token decimals
  Avalanche: 18, // Avalanche token decimals
  USDC: 6, // USDC token decimals
};

const fees = {
  Fantom: {
    1: {
      amount: 1,
      displayAmount: "1", // Display amount as string for user readability
      feeInWei: "1000000000000000000", // Fee in wei for 1 FTM (Fantom)
    },
    // Add more Fantom fees here
  },
  Degen: {
    5: {
      amount: 5,
      displayAmount: "5",
      feeInWei: "5000000000000000000", // Fee in wei for 25 Degen tokens
    },
    // Add more Degen fees here
  },
  //Polygon: {
  //  1: {
  //    amount: 1,
  //    displayAmount: "1",
  //    feeInWei: "1000000000000000000", // Fee in wei for 1 Matic (Polygon)
  //  },
  // Add more Polygon fees here
  // },
  // Avalanche: {
  //   0.025: {
  //     amount: 0.025,
  //    displayAmount: "0.025",
  //    feeInWei: "25000000000000000", // Fee in wei for 0.025 Avalanche tokens
  //  },
  // Add more Avalanche fees here
  // },
  //Base: {
  //  1: {
  //    amount: 1,
  //    displayAmount: "1",
  //    feeInWei: "1000000", // Fee in wei for 1 USDC (Base)
  //  },
  // Add more Base fees here
  // },
};

function weiToNativeToken(weiAmount: string, decimals?: number): string {
  const weiBigInt = BigInt(weiAmount); // Convert wei to BigInt for precision

  // Validate decimals value to ensure it's a valid integer if provided
  if (decimals !== undefined && (!Number.isInteger(decimals) || decimals < 0)) {
    throw new Error(`Invalid decimals value: ${decimals}`);
  }

  // Check if decimals is undefined or invalid, and handle accordingly
  if (decimals === undefined) {
    // Handle case where decimals is not provided (fallback or default behavior)
    console.warn("Decimals value is undefined. Defaulting to zero.");
    return weiBigInt.toString(); // Return amount in wei as a string
  }

  const tokenAmount = weiBigInt / BigInt(10 ** decimals); // Divide by 10^decimals
  return tokenAmount.toString(); // Convert to string for display
}

export { fees, tokenDecimals, weiToNativeToken };
