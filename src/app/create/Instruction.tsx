import React, { useState } from "react";
import { ChevronRight, BookOpen, Lightbulb, User, Coffee } from "lucide-react";
import { useInstructionStore } from "@/store/useInstruction";
import { useTranslation } from "../hook/useTranslation";
import Image from "next/image";
import { set } from "react-hook-form";

export default function Instruction() {
  const displayInstructions = useInstructionStore((state) => state.displayInstructions);
  const setDisplayInstructions = useInstructionStore((state) => state.setDisplayInstructions);

  const currentPage = useInstructionStore((state) => state.currentPage);
  const setCurrentPage = useInstructionStore((state) => state.setCurrentPage);

  const { t } = useTranslation();

  const handleContinue = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    setCurrentPage(currentPage - 1);
  };

  // Page 1 - Tutorial Overview
  const Page1 = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Tutorial Card */}
        <div className="bg-white rounded-t-2xl border-b-4 border-gray-400 shadow-xl overflow-hidden">
          {/* Header dots indicator */}
          <div className="flex justify-center mb-8 pt-8">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-200 to-blue-300 p-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Laptop illustration */}
                <div className="w-32 h-20 bg-gray-700 rounded-lg relative shadow-lg">
                  <div className="w-28 h-16 bg-gray-800 rounded-md absolute top-1 left-2"></div>
                  <div className="w-32 h-2 bg-gray-600 rounded-b-lg absolute -bottom-1"></div>
                </div>

                {/* Character with glasses */}
                <div className="absolute -right-16 -top-4">
                  <div className="w-16 h-16 bg-blue-400 rounded-full relative">
                    {/* Eyes with glasses */}
                    <div className="absolute top-4 left-2">
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <div className="w-3 h-3 bg-black rounded-full"></div>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <div className="w-3 h-3 bg-black rounded-full"></div>
                        </div>
                      </div>
                      {/* Glasses bridge */}
                      <div className="w-1 h-0.5 bg-gray-800 absolute top-3 left-6"></div>
                    </div>
                    {/* Light bulb idea */}
                    <div className="absolute -top-2 -right-2">
                      <Lightbulb className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                    </div>
                  </div>
                </div>

                {/* Books and plant decoration */}
                <div className="absolute -left-8 top-4">
                  <div className="flex flex-col space-y-1">
                    <div className="w-12 h-2 bg-orange-400 rounded"></div>
                    <div className="w-10 h-2 bg-red-400 rounded"></div>
                    <div className="w-8 h-2 bg-green-400 rounded"></div>
                  </div>
                </div>

                <div className="absolute -right-20 top-8">
                  <div className="w-4 h-8 bg-green-500 rounded-t-full"></div>
                  <div className="w-6 h-3 bg-green-700 rounded-full -mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                  onClick={() => setDisplayInstructions(false)}
                >
                  Skip
                </button>
              </div>
              <button
                onClick={handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-b-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
              PART 1: WHAT IS OPENIDEAR ?
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                OpenIdear is an open platform where everyone can share ideas, knowledge, services, and technology. We connect a creative community and support earning through affiliate links.
                Let’s share and spread value together!
              </p>
              <p className="bg-red-50 p-3 rounded-lg border-l-4 border-red-300">
                Join the sharing community – Post your content today!
              </p>
            </div>
          </div>

          {/* Additional placeholder sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md h-40 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md h-40 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 2 - Editor Guide Page
  const Page2 = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Editor Tutorial Card */}
        <div className="bg-white rounded-t-2xl rounded-b-2xl shadow-xl border-b-4 border-gray-400">
          {/* Header dots indicator */}
          <div className="flex justify-center mb-8 pt-8 ">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-200 to-blue-300 p-8 relative">
            {/* Character mascot */}
            <div className="absolute top-4 right-8">
              <div className="w-16 h-16 bg-blue-400 rounded-full relative">
                {/* Eyes with glasses */}
                <div className="absolute top-4 left-2">
                  <div className="flex space-x-1">
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                  </div>
                  {/* Glasses bridge */}
                  <div className="w-1 h-0.5 bg-gray-800 absolute top-3 left-6"></div>
                </div>
                {/* Light bulb idea */}
                <div className="absolute -top-2 -right-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                </div>
              </div>
            </div>

            <div className="pr-20">
              <p className="text-2xl font-bold text-gray-800 mb-6">
                Hướng dẫn sử dụng OpenIdear
              </p>

              {/* Mock Editor Interface */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex max-h-">
                  <img src="/guide/post_image.png" alt="Post Image" width={140} className="w-1/4 rounded-md" />
                  <div className="flex-1 border-r-2 border-gray-200 pl-4">
                    <p className="text-lg font-semibold text-blue-600 mb-4 ml-4">
                      Bài viết bên trái
                    </p>
                    <div className="min-h-16 text-gray-500 text-sm ml-4 ">
                      <div className="w-full">Bạn có thể vào menu bằng cách rê vào cụm tool bên trái</div>
                      <div className="w-full">Chọn các post cũ hoặc tạo mới post ở đây</div>
                    </div>
                  </div>
                  <div className="flex-1 border-l-2 border-gray-200">
                    <p className="text-lg font-semibold text-blue-600 mb-4 ml-4">
                      Tool bar bên phải
                    </p>
                    <div className="min-h-16 text-gray-500 text-sm ml-4 ">
                      <div className="w-full">Bạn có thể vào menu bằng cách rê vào cụm tool bên phải</div>
                      <div className="w-full">Chọn thành phần phù hợp để đưa vào bài viết, sau đó kéo sang Editor</div>
                    </div>
                  </div>
                  <img src="/guide/element_image.png" alt="Post Image" className="w-1/4 h-auto rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                >
                  Back
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer" onClick={() => setDisplayInstructions(false)}>
                  Skip
                </button>
              </div>
              <button
                onClick={handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Page3 = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">


        {/* Main Editor Tutorial Card */}
        <div className="bg-white rounded-t-2xl shadow-xl border-b-4 border-gray-400">
          {/* Header dots indicator */}
          <div className="flex justify-center mb-8 pt-8 ">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-200 to-blue-300 p-8 relative">
            {/* Character mascot */}
            <div className="absolute top-4 right-8">
              <div className="w-16 h-16 bg-blue-400 rounded-full relative">
                {/* Eyes with glasses */}
                <div className="absolute top-4 left-2">
                  <div className="flex space-x-1">
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                  </div>
                  {/* Glasses bridge */}
                  <div className="w-1 h-0.5 bg-gray-800 absolute top-3 left-6"></div>
                </div>
                {/* Light bulb idea */}
                <div className="absolute -top-2 -right-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                </div>
              </div>
            </div>

            <div className="pr-20">
              <p className="text-2xl font-bold text-gray-800 mb-6">
                Editor in the OpenIdeaR
              </p>

              {/* Mock Editor Interface */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <Image src="/guide/editor_image.png" alt="Editor Mockup" width={600} height={300} className="rounded-md" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                >
                  Back
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer" onClick={() => setDisplayInstructions(false)}>
                  Skip
                </button>
              </div>
              <button
                onClick={handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Content Guide Section */}
        <div className="bg-white rounded-b-2xl shadow-md p-8">
          <p className="text-xl font-bold text-gray-800 mb-6">
            PART 3: EDITOR
          </p>

          <div className="space-y-4 text-gray-700">
            <p className="text-lg font-medium mb-2">Hướng dẫn</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Bạn có thể dễ dàng sửa nội dung bằng cách click vào các phần tử</li>
              <li>Sử dụng toolbar ở trên để định dạng văn bản</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const Page4 = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Editor Tutorial Card */}
        <div className="bg-white rounded-t-2xl shadow-xl border-b-4 border-gray-400 mb-4">
          {/* Header dots indicator */}
          <div className="flex justify-center mb-8 pt-8 ">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-200 to-blue-300 p-8 relative">
            {/* Character mascot */}
            <div className="absolute top-0 right-0">
              <div className="w-16 h-16 bg-blue-400 rounded-full relative">
                {/* Eyes with glasses */}
                <div className="absolute top-4 left-2">
                  <div className="flex space-x-1">
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                  </div>
                  {/* Glasses bridge */}
                  <div className="w-1 h-0.5 bg-gray-800 absolute top-3 left-6"></div>
                </div>
                {/* Light bulb idea */}
                <div className="absolute -top-2 -right-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex">
                <div className="flex-1 border-r-2 border-gray-200 pl-4">
                  <div className="min-h-16 text-gray-500 text-sm ml-4 ">
                    <div className="w-full">Bạn có thể xem bản xem trước bằng cách bấm Preview</div>
                    <div className="w-full">Hoặc có thể chọn chế độ HTML để xem và sửa bài viết ở chế độ HTML</div>
                  </div>
                  <img src="/guide/page4one.png" alt="Post Image" width={140} className="w-full rounded-md" />

                </div>
                <div className="flex-1 border-l-2 border-gray-200">
                  <div className="min-h-16 text-gray-500 text-sm ml-4 ">
                    <div className="w-full">Bấm vào đây để public bài viết, bài viết đã public không thể public lại lần nữa</div>
                    <div className="w-full">Nhấn Save Draft để lưu bài viết</div>
                  </div>
                  <img src="/guide/page4two.png" alt="Post Image" className="w-full h-auto rounded-md" />

                </div>
              </div>

            </div>
          </div>

          <div className="p-6 bg-gray-50 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                >
                  Back
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer" onClick={() => setDisplayInstructions(false)}>
                  Skip
                </button>
              </div>
              <button
                onClick={() => {setDisplayInstructions(false); setCurrentPage(1);}}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Kết thúc
              </button>
            </div>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-b-xl p-6 shadow-md h-40 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            <div className="bg-white rounded-b-xl p-6 shadow-md h-40 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );

  return (
    <>
      {displayInstructions && (
        <div className="w-full h-full fixed top-0 right-0 left-0 bg-gray-200/70 z-100">
          {currentPage === 1 && <Page1 />}
          {currentPage === 2 && <Page2 />}
          {currentPage === 3 && <Page3 />}
          {currentPage === 4 && <Page4 />}
          {currentPage === 5 && (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  🎉 Hoàn thành!
                </h1>
                <p className="text-gray-600 mb-6">
                  Bạn đã hoàn thành hướng dẫn cơ bản
                </p>
                <button
                  onClick={() => setDisplayInstructions(false)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Quay lại đầu
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
