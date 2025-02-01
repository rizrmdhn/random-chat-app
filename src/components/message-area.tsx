import MessageList from "./message-list";
import MessageForm from "./message-form";

export default function MessageArea() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <MessageList />
      </div>
      <div className="border-t p-4">
        <MessageForm />
      </div>
    </main>
  );
}
