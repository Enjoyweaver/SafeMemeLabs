"use client"

import { useEffect, useRef, useState } from "react"
import emailjs from "emailjs-com"
import { useAccount } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "@/styles/feedback.css"

const FEEDBACK_ENTRIES = 21
const SAFEMEME_WALLET_ADDRESS = "0x8cfeb8Eacdfe56C5C3B529e5EBf9F76399d8Ca49"

const FeedbackPage = () => {
  const { isConnected, address } = useAccount()
  const [feedback, setFeedback] = useState(
    Array(FEEDBACK_ENTRIES).fill({ text: "", address: "", status: "open" })
  )
  const [featureRequests, setFeatureRequests] = useState([])
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: "Improve the users profile page URL to reference their wallet address",
      completed: false,
      status: "open",
    },
    {
      id: 2,
      text: "Display the users earnings, when they were received, and their current worth on the profile page",
      completed: false,
      status: "open",
    },
    {
      id: 3,
      text: "Show the volume and trade activity of tokens listed on the user's profile page",
      completed: false,
      status: "open",
    },
    {
      id: 4,
      text: "Display the total number of all tokens minted, their volume, and number of trades on the main dashboard",
      completed: false,
      status: "open",
    },
    { id: 5, text: "Touch grass every day", completed: false, status: "open" },
    {
      id: 6,
      text: "Update the token generation contracts to Vyper",
      completed: false,
      status: "open",
    },
    {
      id: 7,
      text: "Install brownie to deploy Vyper contracts",
      completed: false,
      status: "open",
    },
    {
      id: 8,
      text: "Update the swap contracts to Vyper",
      completed: false,
      status: "open",
    },
    {
      id: 9,
      text: "Implement a secure method for storing private keys",
      completed: false,
      status: "open",
    },
    {
      id: 10,
      text: "Integrate automated tests for smart contracts",
      completed: false,
      status: "open",
    },
    {
      id: 11,
      text: "Conduct a comprehensive security audit",
      completed: false,
      status: "open",
    },
    {
      id: 12,
      text: "Implement rate limiting to prevent abuse of the DEX",
      completed: false,
      status: "open",
    },
    {
      id: 13,
      text: "Ensure proper handling of failed transactions",
      completed: false,
      status: "open",
    },
    {
      id: 14,
      text: "Monitor gas prices and optimize contract calls",
      completed: false,
      status: "open",
    },
    {
      id: 15,
      text: "Add detailed logging and monitoring for trade activities",
      completed: false,
      status: "open",
    },
  ])

  const [newFeatureRequest, setNewFeatureRequest] = useState("")
  const [hasSubmittedFeatureRequest, setHasSubmittedFeatureRequest] = useState(
    new Set()
  )
  const [isClient, setIsClient] = useState(false)
  const [votedItems, setVotedItems] = useState(new Set())
  const [pendingFeedback, setPendingFeedback] = useState([])

  const feedbackFormRef = useRef(null)
  const featureFormRef = useRef(null)

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
        text: "Update smart contracts to Vyper",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        id: 3,
        text: "Twitter link to profile",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        id: 4,
        text: "User created Frames",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        id: 5,
        text: "Create Dynamic NFTs",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
    ])
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
  }, [])

  const handleFeedbackChange = (e, index) => {
    const newFeedback = [...feedback]
    newFeedback[index] = {
      text: e.target.value,
      address: address || "",
      status: "open",
    }
    setFeedback(newFeedback)
  }

  const handleSubmitFeedback = async (index) => {
    if (isConnected) {
      if (feedback[index].text === "" || feedback[index].status !== "open") {
        alert("Please enter feedback before submitting.")
        return
      }

      const newPendingFeedback = [
        ...pendingFeedback,
        { ...feedback[index], status: "pending" },
      ]
      setPendingFeedback(newPendingFeedback)

      const newFeedback = [...feedback]
      newFeedback[index].status = "pending"
      setFeedback(newFeedback)

      // Populate form data and send email
      if (feedbackFormRef.current) {
        const form = feedbackFormRef.current
        const userAddress = feedback[index].address
        const userFeedback = feedback[index].text

        // Assign values to form inputs
        form.elements["user_address"].value = userAddress
        form.elements["user_feedback"].value = userFeedback
        form.elements["message_type"].value = "Feedback"

        // Debugging: Log values to check if they are correctly assigned
        console.log("Form Data before sending:")
        console.log("User Address:", form.elements["user_address"].value)
        console.log("User Feedback:", form.elements["user_feedback"].value)
        console.log("Message Type:", form.elements["message_type"].value)

        try {
          const response = await emailjs.sendForm(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            form,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
          )
          console.log(
            "Feedback sent successfully!",
            response.status,
            response.text
          )
        } catch (err) {
          console.error("Failed to send feedback.", err)
        }
      }
    } else {
      alert("Please connect your wallet to submit feedback.")
    }
  }

  const handleFeatureRequestChange = (e) => {
    setNewFeatureRequest(e.target.value)
  }

  const handleSubmitFeatureRequest = async () => {
    if (isConnected) {
      if (newFeatureRequest === "") {
        alert("Please enter a feature request before submitting.")
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

      // Populate form data and send email
      if (featureFormRef.current) {
        const form = featureFormRef.current
        const userAddress = address || SAFEMEME_WALLET_ADDRESS
        const userFeedback = newFeatureRequest

        // Assign values to form inputs
        form.elements["user_address"].value = userAddress
        form.elements["user_feedback"].value = userFeedback
        form.elements["message_type"].value = "Feature Request"

        // Debugging: Log values to check if they are correctly assigned
        console.log("Form Data before sending:")
        console.log("User Address:", form.elements["user_address"].value)
        console.log("User Feedback:", form.elements["user_feedback"].value)
        console.log("Message Type:", form.elements["message_type"].value)

        try {
          const response = await emailjs.sendForm(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            form,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
          )
          console.log(
            "Feature request sent successfully!",
            response.status,
            response.text
          )
        } catch (err) {
          console.error("Failed to send feature request.", err)
        }
      }

      setNewFeatureRequest("")
    } else {
      alert("Please connect your wallet to submit a feature request.")
    }
  }

  const saveVotesToLocalStorage = (
    updatedFeatureRequests,
    updatedVotedItems
  ) => {
    localStorage.setItem(
      "featureRequests",
      JSON.stringify(updatedFeatureRequests)
    )
    localStorage.setItem(
      `votedItems-${address}`,
      JSON.stringify([...updatedVotedItems])
    )
  }

  const handleVote = (id, direction) => {
    if (isConnected) {
      if (votedItems.has(id)) {
        alert("You can only vote once per item.")
        return
      }

      const updatedFeatureRequests = featureRequests
        .map((req) =>
          req.id === id
            ? { ...req, votes: req.votes + (direction === "up" ? 1 : -1) }
            : req
        )
        .sort((a, b) => b.votes - a.votes)

      setFeatureRequests(updatedFeatureRequests)

      const updatedVotedItems = new Set(votedItems).add(id)
      setVotedItems(updatedVotedItems)

      saveVotesToLocalStorage(updatedFeatureRequests, updatedVotedItems)
    } else {
      alert("Please connect your wallet to vote.")
    }
  }

  const saveChecklistToLocalStorage = (items) => {
    localStorage.setItem("checklistItems", JSON.stringify(items))
  }

  const handleToggleChecklistItem = (id, status) => {
    if (address === SAFEMEME_WALLET_ADDRESS) {
      const updatedItems = checklistItems.map((item) =>
        item.id === id
          ? { ...item, status: status, completed: status === "completed" }
          : item
      )
      setChecklistItems(updatedItems)
      saveChecklistToLocalStorage(updatedItems)
    } else {
      alert("Only SafeMeme wallet can check or uncheck items.")
    }
  }

  useEffect(() => {
    const storedChecklistItems = localStorage.getItem("checklistItems")
    if (storedChecklistItems) {
      setChecklistItems(JSON.parse(storedChecklistItems))
    }
  }, [])

  useEffect(() => {
    const storedFeatureRequests = localStorage.getItem("featureRequests")
    if (storedFeatureRequests) {
      setFeatureRequests(JSON.parse(storedFeatureRequests))
    }

    if (address) {
      const storedVotes = localStorage.getItem(`votedItems-${address}`)
      if (storedVotes) {
        setVotedItems(new Set(JSON.parse(storedVotes)))
      }
    }
  }, [address])

  const getShortAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const resetChecklist = () => {
    const resetItems = checklistItems.map((item) => ({
      ...item,
      completed: false,
      status: "open",
    }))
    setChecklistItems(resetItems)
    saveChecklistToLocalStorage(resetItems)
  }

  const resetVotes = () => {
    const resetFeatureRequests = featureRequests.map((request) => ({
      ...request,
      votes: 0,
    }))
    setFeatureRequests(resetFeatureRequests)
    saveVotesToLocalStorage(resetFeatureRequests, new Set())
  }

  return (
    <div className="feedbackBody">
      <Navbar />
      <div className="feedbackContainer">
        <form ref={feedbackFormRef} style={{ display: "none" }}>
          <input type="text" name="user_address" />
          <input type="text" name="user_feedback" />
          <input type="text" name="message_type" />
        </form>
        <form ref={featureFormRef} style={{ display: "none" }}>
          <input type="text" name="user_address" />
          <input type="text" name="user_feedback" />
          <input type="text" name="message_type" />
        </form>

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
                {item.status === "open"
                  ? "Open for feedback"
                  : item.status === "pending"
                  ? "Pending"
                  : "Approved"}
              </span>
              <button
                onClick={() => handleSubmitFeedback(index)}
                className="feedbackButton"
                disabled={!isConnected || item.status !== "open"}
              >
                Submit Feedback
              </button>
            </div>
          ))}
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
                <button
                  onClick={() =>
                    handleToggleChecklistItem(item.id, "inProgress")
                  }
                >
                  {item.status === "inProgress" ? "In Progress" : "Start"}
                </button>
                <button
                  onClick={() =>
                    handleToggleChecklistItem(item.id, "completed")
                  }
                >
                  {item.completed ? "☑️" : "Complete"}
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
