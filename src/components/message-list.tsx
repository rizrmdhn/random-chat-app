const messages = [
  { id: 1, user: "Alice", content: "Hey everyone!", isSentByUser: false },
  { id: 2, user: "You", content: "Hi Alice, how are you?", isSentByUser: true },
  { id: 3, user: "Charlie", content: "Hello there!", isSentByUser: false },
  { id: 4, user: "You", content: "Great to see you all!", isSentByUser: true },
]

export default function MessageList() {
  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.isSentByUser ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              message.isSentByUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {!message.isSentByUser && <p className="font-semibold text-sm mb-1">{message.user}</p>}
            <p>{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

