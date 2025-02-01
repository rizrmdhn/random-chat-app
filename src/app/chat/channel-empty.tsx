export default function ChannelEmpty() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          No channel selected
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Choose a channel from the sidebar to start chatting
        </p>
      </div>
    </main>
  );
}
