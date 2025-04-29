import React, { useEffect, useState } from "react";

export default function ContentModal() {
  const [chatData, setChatData] = useState([]);

  function refresh() {
    const fetchChats = async () => {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setChatData(data);
      }
    };

    fetchChats();
  }

  useEffect(() => {
    refresh();
    let interval = setInterval(() => {
      refresh();
      console.log("useffect is calling eveery 10 second");
    }, 10 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex justify-end pt-12">
      <div className="z-10  w-[350px] h-[450px] flex space-y-6 items-center  flex-col bg-gradient-to-tr  from-slate-300/30 via-gray-400/30 to-slate-600-400/30 p-4  backdrop-blur-md rounded-xl border-slate-100/30 border">
        <div className="font-extrabold">Chat History</div>
        <div className="overflow-auto">
          <div>
            {chatData.map((chat, index) => (
              <div key={index}>
                <div>
                  <h1 className="p-1 font-semibold">{chat.question}</h1>
                </div>
                <div>
                  <h3 className="p-1 font-thin">{chat.answer}</h3>
                </div>
                <hr className="p-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
