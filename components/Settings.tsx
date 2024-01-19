interface SettingsProps {
    apiKey: string;
    setApiKey: (value: string) => void;
    mode: string;
    setMode: (value: string) => void;
    matchCount: number;
    setMatchCount: (value: number) => void;
    handleSave: () => void;
    handleClear: () => void;
  }

export default function Settings({ apiKeystring, setApiKey, mode, setMode, matchCount, setMatchCount, handleSave, handleClear }) {
    return (
      <div className="w-[340px] sm:w-[400px]">
        {/* Mode selection */}
        <div>
          <div>Mode</div>
          <select
              className="max-w-[400px] block w-full cursor-pointer rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as "search" | "chat")}
          >
            <option value="search">Search</option>
            <option value="chat">Chat</option>
          </select>
        </div>
  
        {/* Results count input */}
        <div className="mt-2">
          <div>Results Count</div>
          <input
              type="number"
              min={1}
              max={10}
              value={matchCount}
              onChange={(e) => setMatchCount(Number(e.target.value))}
              className="max-w-[400px] block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          />
        </div>
  
        {/* API key input */}
        <div className="mt-2">
          <div>OpenAI API Key</div>
          <input
              type="password"
              placeholder="OpenAI API Key"
              className="max-w-[400px] block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
              }}
          />
        </div>
  
        {/* Save and clear buttons */}
        <div className="mt-4 flex space-x-2 justify-center">
          <div
              className="flex cursor-pointer items-center space-x-2 rounded-full bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
              onClick={handleSave}
          >
            Save
          </div>
  
          <div
              className="flex cursor-pointer items-center space-x-2 rounded-full bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              onClick={handleClear}
          >
            Clear
          </div>
        </div>
      </div>
    );
  }