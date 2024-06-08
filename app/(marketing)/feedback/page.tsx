"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

// Ensure this import is present

import { Navbar } from "@/components/walletconnect/walletconnect"

import "@/styles/feedback.css"

const FEEDBACK_ENTRIES = 21
const SAFEMEME_WALLET_ADDRESS = "0x8cfeb8Eacdfe56C5C3B529e5EBf9F76399d8Ca49"

const FeedbackPage = () => {
  const { isConnected, address } = useAccount()
  const [feedback, setFeedback] = useState<
    { text: string; address: string; status: "pending" | "approved" }[]
  >(Array(FEEDBACK_ENTRIES).fill({ text: "", address: "", status: "pending" }))
  const [featureRequests, setFeatureRequests] = useState<
    { id: number; text: string; votes: number; address: string }[]
  >([])
  const [checklistItems, setChecklistItems] = useState<
    { id: number; text: string; completed: boolean }[]
  >([
    {
      id: 1,
      text: "Improve the users profile page URL to reference their wallet address",
      completed: false,
    },
    {
      id: 2,
      text: "Display the users earnings, when they were received, and their current worth on the profile page",
      completed: false,
    },
    {
      id: 3,
      text: "Show the volume and trade activity of tokens listed on the user's profile page",
      completed: false,
    },
    {
      id: 4,
      text: "Display the total number of all tokens minted, their volume, and number of trades on the main dashboard",
      completed: false,
    },
    { id: 5, text: "Touch grass every day", completed: false },
    {
      id: 6,
      text: "Update the token generation contracts to Vyper",
      completed: false,
    },
    {
      id: 7,
      text: "Install brownie to deploy Vyper contracts",
      completed: false,
    },
    { id: 8, text: "Update the swap contracts to Vyper", completed: false },
    {
      id: 9,
      text: "Implement a secure method for storing private keys",
      completed: false,
    },
    {
      id: 10,
      text: "Integrate automated tests for smart contracts",
      completed: false,
    },
    {
      id: 11,
      text: "Conduct a comprehensive security audit",
      completed: false,
    },
    {
      id: 12,
      text: "Implement rate limiting to prevent abuse of the DEX",
      completed: false,
    },
    {
      id: 13,
      text: "Ensure proper handling of failed transactions",
      completed: false,
    },
    {
      id: 14,
      text: "Monitor gas prices and optimize contract calls",
      completed: false,
    },
    {
      id: 15,
      text: "Add detailed logging and monitoring for trade activities",
      completed: false,
    },
  ])
  const [newFeatureRequest, setNewFeatureRequest] = useState<string>("")
  const [hasSubmittedFeatureRequest, setHasSubmittedFeatureRequest] = useState<
    Set<string>
  >(new Set())
  const [isClient, setIsClient] = useState(false)
  const [votedItems, setVotedItems] = useState<Set<number>>(new Set())
  const [pendingFeedback, setPendingFeedback] = useState<
    { text: string; address: string }[]
  >([])

  useEffect(() => {
    setIsClient(true)
    setFeatureRequests([
      {
        id: 1,
        text: "Safe Token Swap",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        id: 2,
        text: "Twitter postable link",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        id: 3,
        text: "NFT Dashboard",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
    ])
  }, [])

  const handleFeedbackChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newFeedback = [...feedback]
    newFeedback[index] = {
      text: e.target.value,
      address: address || "",
      status: "pending",
    }
    setFeedback(newFeedback)
  }

  const handleSubmitFeedback = () => {
    if (isConnected) {
      console.log("Feedback submitted:", feedback)
      setPendingFeedback([
        ...pendingFeedback,
        ...feedback.filter((item) => item.status === "pending"),
      ])
      setFeedback(
        feedback.map((item) =>
          item.status === "pending" ? { ...item, status: "approved" } : item
        )
      )
    } else {
      alert("Please connect your wallet to submit feedback.")
    }
  }

  const handleFeatureRequestChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewFeatureRequest(e.target.value)
  }

  const handleSubmitFeatureRequest = () => {
    if (isConnected) {
      if (hasSubmittedFeatureRequest.has(address)) {
        alert("You can only submit one feature request.")
        return
      }

      setFeatureRequests((prevRequests) => [
        ...prevRequests,
        {
          id: prevRequests.length + 1,
          text: newFeatureRequest,
          votes: 0,
          address: address || SAFEMEME_WALLET_ADDRESS,
        },
      ])
      setHasSubmittedFeatureRequest(
        new Set(hasSubmittedFeatureRequest).add(address)
      )
      setNewFeatureRequest("")
    } else {
      alert("Please connect your wallet to submit a feature request.")
    }
  }

  const handleVote = (id: number, direction: "up" | "down") => {
    if (isConnected) {
      if (votedItems.has(id)) {
        alert("You can only vote once per item.")
        return
      }

      setFeatureRequests((prevRequests) =>
        prevRequests
          .map((req) =>
            req.id === id
              ? { ...req, votes: req.votes + (direction === "up" ? 1 : -1) }
              : req
          )
          .sort((a, b) => b.votes - a.votes)
      )

      setVotedItems(new Set(votedItems).add(id))
      localStorage.setItem(
        `votedItems-${address}`,
        JSON.stringify([...votedItems, id])
      )
    } else {
      alert("Please connect your wallet to vote.")
    }
  }

  const handleToggleChecklistItem = (id: number) => {
    if (address === SAFEMEME_WALLET_ADDRESS) {
      setChecklistItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      )
    } else {
      alert("Only SafeMeme wallet can check or uncheck items.")
    }
  }

  useEffect(() => {
    if (address) {
      const storedVotes = localStorage.getItem(`votedItems-${address}`)
      if (storedVotes) {
        setVotedItems(new Set(JSON.parse(storedVotes)))
      }
    }
  }, [address])

  const getShortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="feedbackBody">
      <Navbar />
      <div className="feedbackContainer">
        <div className="feedbackSection feedbackLeft">
          <h2 className="feedbackTitle">Feedback</h2>
          {feedback.map((item, index) => (
            <div key={index} className="feedbackInputContainer">
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleFeedbackChange(e, index)}
                placeholder={`Feedback ${index + 1}`}
                className="feedbackInput"
                disabled={!isConnected || item.status === "approved"}
              />
              <a
                href={`/profile/${item.address}`}
                className="feedbackWallet"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getShortAddress(item.address)}
              </a>
              <span className={`feedbackStatus ${item.status}`}>
                {item.status === "pending" ? "Pending" : "Approved"}
              </span>
            </div>
          ))}
          <button onClick={handleSubmitFeedback} className="feedbackButton">
            Submit Feedback
          </button>
        </div>

        <div className="feedbackSection feedbackRight">
          <h2 className="feedbackTitle">Feature Requests</h2>
          <ul className="feedbackUl">
            {featureRequests.map((request) => (
              <li key={request.id} className="feedbackLi">
                <span>{request.text}</span>
                <div>
                  <button onClick={() => handleVote(request.id, "up")}>
                    👍
                  </button>
                  <span>{request.votes}</span>
                  <button onClick={() => handleVote(request.id, "down")}>
                    👎
                  </button>
                </div>
                <a
                  href={`/profile/${request.address}`}
                  className="feedbackWallet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getShortAddress(request.address)}
                </a>
              </li>
            ))}
          </ul>
          <h3 className="feedbackTitle">Submit a Feature Request</h3>
          <input
            type="text"
            value={newFeatureRequest}
            onChange={handleFeatureRequestChange}
            placeholder="New feature request"
            className="feedbackInput"
            disabled={hasSubmittedFeatureRequest.has(address)}
          />
          <button
            onClick={handleSubmitFeatureRequest}
            className="feedbackButton"
          >
            Submit Feature Request
          </button>
        </div>
        <div className="feedbackSection feedbackChecklist">
          <h2 className="feedbackTitle">To-Do List</h2>
          <ul className="feedbackUl">
            {checklistItems.map((item) => (
              <li key={item.id} className="checklistItem">
                <span
                  style={{
                    textDecoration: item.completed ? "line-through" : "none",
                  }}
                >
                  {item.text}
                </span>
                <button onClick={() => handleToggleChecklistItem(item.id)}>
                  {item.completed ? "☑️" : "☐"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage
