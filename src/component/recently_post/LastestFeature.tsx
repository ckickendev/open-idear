'use client'
import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import Article from "./Article";
import Logo from "../common/Logo";
import { useTranslation } from "@/app/hook/useTranslation";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import LoadingComponent from "../common/Loading";
import MainFeature from "./MainFeature";
import { PostInterface } from "@/app/profile/[profileId]/page";
import ArticleRightSide from "./ArticleRightSide";

const LastestFeature = () => {
  const { t } = useTranslation();
  const [selectFeature, setSelectFeature] = useState(0);
  const [allCategory, setAllCategory] = useState<any[]>([ {name: "Tất cả", slug: 'all'} ]);
  const [allPosts, setAllPosts] = useState<PostInterface[]>([]);

  const isLoading = loadingStore(state => state.isLoading);
  const changeLoad = loadingStore((state) => state.changeLoad);

  useEffect(() => {
    const fetchRecentlyData = async () => {
      try {
        changeLoad();
        const token = localStorage.getItem("access_token");
        if (token) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getRecentlyData`);
          if (response.status === 200) {
            console.log("recently data: ", response.data.recentlyData.posts, response.data.recentlyData.categories);

            setAllCategory((old) => [...old, ...response.data.recentlyData.categories]);
            setAllPosts(response.data.recentlyData.posts);
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

  const onSelectFeature = async (index: number) => {
    setSelectFeature(index);

    try {
        changeLoad();
        const token = localStorage.getItem("access_token");
        if (token) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getRecentlyDataByFeatures`, {
            params: {
              feature: allCategory[index].slug,
            },
          });
          if (response.status === 200) {
            console.log("recently data: ", response.data.recentlyData.posts, response.data.recentlyData.categories);
            setAllPosts(response.data.recentlyData.posts);
          }
        }
      } catch (error: any) {
        // setType('error');
        // setMessage(error.response?.data?.message || 'Failed to fetch marked posts');
      } finally {
        changeLoad();
      }
  }

  const renderFeature = () => {
    return allCategory.slice(0, 6).map((category, index) => {
      return (
        <button
          key={index}
          className={`${index === selectFeature
            ? "bg-blue-100 text-blue-500 px-4 py-2 rounded mr-2 cursor-pointer"
            : "text-gray-600 px-4 py-2 rounded mr-2 cursor-pointer"
            }`}
          onClick={() => onSelectFeature(index)}
        >
          {category.name}
        </button>
      );
    });
  };

  const renderArticle = () => {
    return allPosts.map((data: PostInterface, index: number) => {
      console.log("data in render article: ", data);
      return (
        <Article
          key={index}
          postData={data}
        />
      );
    });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 border-1 border-gray-300 rounded p-4">
        <LoadingComponent isLoading={isLoading} />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="font-bold text-xl text-gray-800 mr-6">
              {t('component.lastest_feature.last')}
            </h2>
            <div className={`border-b-4 border-blue-500 w-12 absolute mt-10`}></div>

            <div className="flex ml-4">{renderFeature()}</div>
          </div>

          <div className="flex items-center">
            <span className="font-semibold">{t('component.lastest_feature.more')}</span>
            <ChevronRight className="ml-1" size={20} />
          </div>
        </div>

        {/* Main Featured Content */}
          <div className="flex gap-4 mb-8 ">
            <MainFeature postData={allPosts[0]} />

            <div className="w-1/5">
              <ArticleRightSide
                postData={allPosts[1]}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">{renderArticle()}</div>
        </div>

    </>
  );
};

export default LastestFeature;
