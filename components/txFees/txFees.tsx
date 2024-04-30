// Import the fees module
import { fees, tokenDecimals, weiToNativeToken } from "./fees";
import styles from "./page.module.css";

export default function MyComponent() {
  return (
    <div className={styles.appBody}>
      <h2 className={styles.appHeader}>Token creation fees per blockchain:</h2>
      {Object.keys(fees).map((blockchain) => {
        const blockchainFees = fees[blockchain];
        const decimals = tokenDecimals[blockchain];

        return (
          <div key={blockchain} className={styles.blockchainRow}>
            <p>
              {blockchain} Fees:{" "}
              {Object.keys(blockchainFees).map((feeKey) => {
                const fee = blockchainFees[feeKey];
                const feeInWei = fee.feeInWei;
                const amount = fee.amount;
                const displayAmount = fee.displayAmount;
                const feeInTokens = weiToNativeToken(feeInWei, decimals);

                return (
                  <span key={feeKey}>
                    {displayAmount} {blockchain} token(s)
                  </span>
                );
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
