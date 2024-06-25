import { CARD_DIMENSIONS, TOKEN_IMAGE } from "../lib/config"

export function Card({ message, image }: { message: string; image?: string }) {
  const imageSrc = image ?? TOKEN_IMAGE
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        ...CARD_DIMENSIONS,
      }}
    >
      <img
        style={{ width: "100%", height: "100%", marginTop: "-212px" }}
        src={imageSrc}
      />
      {message && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "0",
            width: "100%",
            background: "rgb(64, 27, 114)",
            color: "white",
            fontSize: "24px",
            paddingTop: "58px",
            paddingBottom: "108px",
          }}
        >
          <p style={{ margin: "0 auto" }}>{message}</p>
        </div>
      )}
    </div>
  )
}
