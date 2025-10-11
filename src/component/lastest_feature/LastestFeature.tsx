'use client'
import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import Article from "./Article";
import Logo from "../common/Logo";
import { useTranslation } from "@/app/hook/useTranslation";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import LoadingComponent from "../common/Loading";

const LastestFeature = () => {
  const { t } = useTranslation();
  const [selectFeature, setSelectFeature] = useState(0);

  const isLoading = loadingStore(state => state.isLoading);
  const changeLoad = loadingStore((state) => state.changeLoad);
  const feature = [
    "All Features",
    "Casino",
    "Online Slots",
    "Payments",
    "Poker",
    "Software",
    "Sports Betting",
  ];
  const data = [
    {
      category: "SPORTS BETTING",
      description:
        "Augmented Reality Sports Experience Explained: Live Sports, Upgraded",
      author: "STUART HUGHES",
      time: "3 days",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
    {
      category: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
    {
      category: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "Hello CULLEN",
      time: "1 week",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
    {
      category: "SPORTS BETTING",
      description:
        "Augmented Reality Sports Experience Explained: Live Sports, Upgraded",
      author: "STUART HUGHES",
      time: "3 days",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
    {
      category: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
    {
      category: "CASINO",
      description:
        "Reel of 36 Roulette Facts You Didn't Know: Give It Some Spin",
      author: "PAUL CULLEN",
      time: "1 week",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
    {
      category: "SPORTS BETTING",
      description:
        "Augmented Reality Sports Experience Explained: Live Sports, Upgraded",
      author: "STUART HUGHES",
      time: "3 days",
      image:
        "https://staticg.sportskeeda.com/editor/2024/01/dbf0b-17050057959126-1920.jpg",
    },
  ];

  useEffect(() => {
    const fetchRecentlyData = async () => {
      try {
        changeLoad();
        const token = localStorage.getItem("access_token");
        if (token) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getRecentlyData`);
          if (response.status === 200) {
            setMarkedPosts(response.data.markedPost);
          }
        }
      } catch (error: any) {
        // setType('error');
        // setMessage(error.response?.data?.message || 'Failed to fetch marked posts');
      } finally {
        changeLoad();
      }
    }
    // Fetch data if needed
    fetchRecentlyData();
  }, []);

  const renderFeature = () => {
    return feature.map((data, index) => {
      return (
        <button
          key={index}
          className={`${index === selectFeature
              ? "bg-blue-100 text-blue-500 px-4 py-2 rounded mr-2 cursor-pointer"
              : "text-gray-600 px-4 py-2 rounded mr-2 cursor-pointer"
            }`}
          onClick={() => setSelectFeature(index)}
        >
          {data}
        </button>
      );
    });
  };

  const renderArticle = () => {
    return data.slice(2).map((data: any, index: number) => {
      return (
        <Article
          key={index}
          category={data.category}
          description={data.description}
          author={data.author}
          time={data.time}
          image={data.image}
        />
      );
    });
  };
  return (
    <>
      <div className="max-w-6xl mx-auto p-4">
        <LoadingComponent isLoading={isLoading} />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="font-bold text-xl text-gray-800 mr-6">
              {t('component.lastest_feature.last')}
            </h2>
            <div className="border-b-4 border-blue-500 w-12 absolute mt-10"></div>

            <div className="flex ml-4">{renderFeature()}</div>
          </div>

          <div className="flex items-center">
            <span className="font-semibold">{t('component.lastest_feature.more')}</span>
            <ChevronRight className="ml-1" size={20} />
          </div>
        </div>

        {/* Main Featured Content */}
        <div className="flex gap-4 mb-8">
          <div className="flex w-4/5 border rounded border-gray-300 p-4">
            <div className="h-full w-3/5 bg-blue-400 rounded overflow-hidden relative">
              <div className="absolute top-2 right-2 p-1 rounded">
                <Logo />
              </div>
              <img
                src="https://www.techopedia.com/wp-content/uploads/2025/04/What-Makes-an-iGaming-App-Great-in-2025-Expert-Insights.webp"
                alt="Slot machine in futuristic setting"
                className="w-full h-full  object-cover"
              />
            </div>
            <div className="m-8 w-2/5">
              <div className="flex items-center mb-2">
                <Logo />
                <span className="font-semibold">{t('component.lastest_feature.newest')}</span>
              </div>

              <div className="text-blue-600 font-semibold text-sm mb-2 cursor-pointer hover:underline">
                GAMBLING
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2 cursor-pointer hover:underline">
                Best of Both Worlds? Where Gambling & Gaming Overlap
              </h2>

              <div className="flex items-center text-sm text-gray-600 mb-4">
                <span className="font-medium cursor-pointer hover:underline">
                  MARK DE WOLF
                </span>
                <span className="mx-2">•</span>
                <span>3 days</span>
              </div>

              <p className="text-gray-700">
                Gambling and gaming used to be worlds apart. Now, a hybrid space
                is emerging that mixes immersive gameplay with betting market
                features like randomized...
              </p>
            </div>
          </div>

          <div className="w-1/5">
            <Article
              category={data[0].category}
              description={data[0].description}
              author={data[0].author}
              time={data[0].time}
              image={data[0].image}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">{renderArticle()}</div>
      </div>
    </>
  );
};

export default LastestFeature;
