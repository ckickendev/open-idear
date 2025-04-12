import React from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import Article from "./Article";

const LastestFeature = () => {
  const data = [
    {
      title: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
    },
    {
      title: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "Hello CULLEN",
      time: "1 week",
    },
    {
      title: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
    },
    {
      title: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
    },
    {
      title: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
    },
  ];

  const renderArticle = () => {
    return data.map((data: any, index: number) => {
      return (
        <Article
          key={index}
          title={data.title}
          description={data.description}
          author={data.author}
          time={data.time}
        />
      );
    });
  };
  return (
    <>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="font-bold text-xl text-gray-800 mr-6">
              Latest Features
            </h2>
            <div className="border-b-4 border-blue-500 w-12 absolute mt-10"></div>

            <div className="flex ml-4">
              <button className="bg-blue-100 text-blue-500 px-4 py-2 rounded mr-2">
                All Features
              </button>
              <button className="text-gray-600 px-4 py-2 rounded mr-2">
                Casino
              </button>
              <button className="text-gray-600 px-4 py-2 rounded mr-2">
                Online Slots
              </button>
              <button className="text-gray-600 px-4 py-2 rounded mr-2">
                Payments
              </button>
              <button className="text-gray-600 px-4 py-2 rounded mr-2">
                Poker
              </button>
              <button className="text-gray-600 px-4 py-2 rounded mr-2">
                Software
              </button>
              <button className="text-gray-600 px-4 py-2 rounded">
                Sports Betting
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <span className="font-semibold">More</span>
            <ChevronRight className="ml-1" size={20} />
          </div>
        </div>

        {/* Main Featured Content */}
        <div className="flex gap-4 mb-8">
          <div className="w-2/5 relative">
            <div className="h-64 bg-blue-400 rounded overflow-hidden relative">
              <div className="absolute top-2 right-2 bg-blue-600 p-1 rounded">
                <ChevronUp className="text-white" size={16} />
              </div>
              <img
                src="/api/placeholder/400/320"
                alt="Slot machine in futuristic setting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-3/5 border rounded p-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                <ChevronUp className="text-blue-600" size={16} />
              </div>
              <span className="font-semibold">Top Story</span>
            </div>

            <div className="text-blue-600 font-semibold text-sm mb-2">
              GAMBLING
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Best of Both Worlds? Where Gambling & Gaming Overlap
            </h2>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="font-medium">MARK DE WOLF</span>
              <span className="mx-2">•</span>
              <span>3 days</span>
            </div>

            <p className="text-gray-700">
              Gambling and gaming used to be worlds apart. Now, a hybrid space
              is emerging that mixes immersive gameplay with betting market
              features like randomized...
            </p>
          </div>

          <div className="w-1/4">
            <div className="h-40 bg-gray-200 rounded overflow-hidden">
              <img
                src="/api/placeholder/300/200"
                alt="Person wearing VR headset"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-2">
              <div className="text-blue-600 font-semibold text-sm">
                SPORTS BETTING
              </div>
              <h3 className="font-bold text-gray-800">
                Augmented Reality Sports Experience Explained: Live Sports,
                Upgraded
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className="font-medium">STUART HUGHES</span>
                <span className="mx-2">•</span>
                <span>3 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-5 gap-4">{renderArticle()}</div>
      </div>
    </>
  );
};

export default LastestFeature;
