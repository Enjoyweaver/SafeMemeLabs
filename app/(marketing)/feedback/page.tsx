"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import emailjs from "emailjs-com"
import { useAccount } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "@/styles/feedback.css"

const FEEDBACK_ENTRIES = 21
const SAFEMEME_WALLET_ADDRESS = "0x8cfeb8Eacdfe56C5C3B529e5EBf9F76399d8Ca49"
const HNDL_address = "0x34B4C11DF80599C315dCe3F7aaC816d1e1F26496"

const FeedbackPage = () => {
  const { isConnected, address } = useAccount()

  const [featureRequests, setFeatureRequests] = useState([])
  const [firstFeedback, setFirstFeedback] = useState({
    text: "",
    address: "",
    status: "open",
  })
  const feedbackInitialState = Array(FEEDBACK_ENTRIES).fill({
    text: "",
    address: "",
    status: "open",
  })

  feedbackInitialState[0] = {
    text: "Integrate HNDL into SafeMemes!",
    address: "0x34B4C11DF80599C315dCe3F7aaC816d1e1F26496",
    status: "approved",
  }

  const [feedback, setFeedback] = useState(feedbackInitialState)
  const [checklistItems, setChecklistItems] = useState([
    {
      text: "Create SafeLaunch frontend to interact with SafeLaunch backend",
      completed: false,
      status: "open",
    },
    {
      text: "Create SafeLaunch backend functionality",
      completed: false,
      status: "open",
    },
    {
      text: "Udpdate newly added link for each users profile page",
      completed: false,
      status: "open",
    },
    {
      text: "Update metadata for all pages",
      completed: false,
      status: "open",
    },
    {
      text: "Create guide / tutorial roadmap",
      completed: false,
      status: "open",
    },

    {
      text: "Improve disconnect button UI",
      completed: false,
      status: "open",
    },
    {
      text: "Improve the users profile page URL to reference their wallet address",
      completed: false,
      status: "open",
    },
    {
      text: "Display the users earnings, when they were received, and their current worth on the profile page",
      completed: false,
      status: "open",
    },
    {
      text: "Show the volume and trade activity of tokens listed on the user's profile page",
      completed: false,
      status: "open",
    },
    {
      text: "Display the total number of all tokens minted, their volume, and number of trades on the main dashboard",
      completed: false,
      status: "open",
    },
    { text: "Touch grass every day", completed: false, status: "open" },
    {
      text: "Update the token generation contracts to Vyper",
      completed: false,
      status: "open",
    },
    {
      text: "Install brownie to deploy Vyper contracts",
      completed: false,
      status: "open",
    },
    {
      text: "Update the swap contracts to Vyper",
      completed: false,
      status: "open",
    },
    {
      text: "Implement a secure method for storing private keys",
      completed: false,
      status: "open",
    },
    {
      text: "Integrate automated tests for smart contracts",
      completed: false,
      status: "open",
    },
    {
      text: "Conduct a comprehensive security audit",
      completed: false,
      status: "open",
    },
    {
      text: "Implement rate limiting to prevent abuse of the DEX",
      completed: false,
      status: "open",
    },
    {
      text: "Ensure proper handling of failed transactions",
      completed: false,
      status: "open",
    },
    {
      text: "Monitor gas prices and optimize contract calls",
      completed: false,
      status: "open",
    },
    {
      text: "Add detailed logging and monitoring for trade activities",
      completed: false,
      status: "open",
    },
    {
      text: "Update token dashboard for all tokens created",
      completed: true,
      status: "open",
    },
    {
      text: "Add popup swap in the token dashboard under each token",
      completed: true,
      status: "open",
    },
    {
      text: "Create dashboard for created tokens",
      completed: true,
      status: "open",
    },
    {
      text: "Create dashboard component showing first 100 $bubbles tokenholders that havent sold yet",
      completed: true,
      status: "Completed",
    },
    {
      text: "Update token factory page to only allow token deploying until the swap is done",
      completed: true,
      status: "Completed",
    },
    {
      text: "Improve mobile swap UI",
      completed: true,
      status: "Completed",
    },
    {
      text: "Add Chainlink Data Streams for Arbitrum",
      completed: true,
      status: "Completed",
    },
    {
      text: "Add Chainlink Data Feeds for Avalanche, Base, and Fantom",
      completed: true,
      status: "Completed",
    },
    {
      text: "Create safe token generator on Avalanche, Base, Degen, Fantom, and Rootstock",
      completed: true,
      status: "Completed",
    },
    {
      text: "Implement Frames into our Nextjs app",
      completed: true,
      status: "Completed",
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
        text: "Integrate HNDL into SafeMemes",
        votes: 0,
        address: HNDL_address,
      },
      {
        text: "Create a SafeDEX",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        text: "Update smart contracts to Vyper",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        text: "Twitter link to profile",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
        text: "User created Frames",
        votes: 0,
        address: SAFEMEME_WALLET_ADDRESS,
      },
      {
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

  const handleVote = (index, direction) => {
    if (isConnected) {
      if (votedItems.has(index)) {
        alert("You can only vote once per item.")
        return
      }

      const updatedFeatureRequests = featureRequests
        .map((req, i) =>
          i === index
            ? { ...req, votes: req.votes + (direction === "up" ? 1 : -1) }
            : req
        )
        .sort((a, b) => b.votes - a.votes)

      setFeatureRequests(updatedFeatureRequests)

      const updatedVotedItems = new Set(votedItems).add(index)
      setVotedItems(updatedVotedItems)

      saveVotesToLocalStorage(updatedFeatureRequests, updatedVotedItems)
    } else {
      alert("Please connect your wallet to vote.")
    }
  }

  const saveChecklistToLocalStorage = (items) => {
    localStorage.setItem("checklistItems", JSON.stringify(items))
  }

  const handleToggleChecklistItem = (index, status) => {
    if (address === SAFEMEME_WALLET_ADDRESS) {
      const updatedItems = checklistItems.map((item, i) =>
        i === index
          ? { ...item, status: status, completed: status === "completed" }
          : item
      )
      setChecklistItems(updatedItems)
      saveChecklistToLocalStorage(updatedItems) // Ensure items are saved after update
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
      <div>
        <p className="blogLink">
          Learn more about this page in our Feedback{" "}
          <Link href="/blog/feedback">
            <span className="underline-link">Blog</span>
          </Link>{" "}
          post.
        </p>
      </div>
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
                disabled={item.status === "approved"}
              />
              <div className="feedbackDetailsRow">
                <a
                  href={`/profile/${item.address}`}
                  className="feedbackWalletLarge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.address !== ""
                    ? getShortAddress(item.address)
                    : "Not provided"}
                </a>
                <span className={`feedbackStatusLarge ${item.status}`}>
                  {item.status === "open"
                    ? "Open for feedback"
                    : item.status === "pending"
                    ? "Pending"
                    : "Approved"}
                </span>
              </div>
              {item.status === "open" && (
                <div className="feedbackButtonContainer">
                  <button
                    onClick={() => handleSubmitFeedback(index)}
                    className="feedbackButton"
                    disabled={!isConnected}
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="feedbackSection feedbackRight">
          <h2 className="feedbackTitle">Feature Requests</h2>
          <ul className="feedbackUl">
            {featureRequests.map((request, index) => (
              <li key={index} className="feedbackLi">
                <span>{request.text}</span>
                <div>
                  <button onClick={() => handleVote(index, "up")}>👍</button>
                  <span>{request.votes}</span>
                  <button onClick={() => handleVote(index, "down")}>👎</button>
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
          <button onClick={resetVotes} className="feedbackButton resetButton">
            Reset Votes
          </button>
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
            {checklistItems.map((item, index) => (
              <li key={index} className="checklistItem">
                <span
                  style={{
                    textDecoration: item.completed ? "line-through" : "none",
                  }}
                >
                  {item.text}
                </span>
                <div className="buttonContainer">
                  {item.status !== "Completed" && (
                    <button
                      onClick={() =>
                        handleToggleChecklistItem(index, "inProgress")
                      }
                    >
                      {item.status === "inProgress" ? "In Progress" : "Start"}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleToggleChecklistItem(index, "completed")
                    }
                  >
                    {item.completed ? "☑️" : "Complete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={resetChecklist}
            className="feedbackButton resetButton"
          >
            Reset Checklist
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage
