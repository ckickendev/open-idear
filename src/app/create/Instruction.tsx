import React, { useState } from "react";
import { ChevronRight, BookOpen, Lightbulb, User, Coffee } from "lucide-react";
import { useInstructionStore } from "@/store/useInstruction";

export default function Instruction() {
  const displayInstructions = useInstructionStore((state) => state.displayInstructions);
  const setDisplayInstructions = useInstructionStore((state) => state.setDisplayInstructions);

  const currentPage = useInstructionStore((state) => state.currentPage);
  const setCurrentPage = useInstructionStore((state) => state.setCurrentPage);

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
        {/* Header dots indicator */}

        {/* Main Tutorial Card */}
        <div className="bg-white rounded-t-2xl border-b-4 border-gray-400 shadow-xl overflow-hidden">
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
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  Bỏ qua hướng dẫn
                </h3>
              </div>
              <button
                onClick={handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Tiếp tục</span>
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
              PHẦN 1: SPIDERUM LÀ GÌ?
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Spiderum là nền tảng viết lách, chia sẻ và thảo luận văn minh
                dành cho người Việt với gần 100,000 thành viên, hơn 40,000 bài
                viết cùng hơn 12 triệu người truy cập và theo dõi liên tục đến
                6/2021
              </p>
              <p className="bg-red-50 p-3 rounded-lg border-l-4 border-red-300">
                Ở Spiderum, bạn có thể đọc và tương tác với những bài viết đầy
                ấy chính cống đóng góp, đồng thời cất lên tiếng nói của chính
                mình thông qua những bài viết của bạn thân.
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
        {/* Header dots indicator */}
        <div className="flex justify-center mb-8 pt-8 ">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Main Editor Tutorial Card */}
        <div className="bg-white rounded-t-2xl shadow-xl border-b-4 border-gray-400">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Hướng dẫn sử dụng Spiderum
              </h1>

              {/* Mock Editor Interface */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Spiderum là gì?
                </h2>

                {/* Toolbar */}
                <div className="flex items-center space-x-2 p-2 border-b border-gray-200 mb-4">
                  <button className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">
                    H3
                  </button>
                  <button className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">
                    H2
                  </button>
                  <button className="px-2 py-1 text-sm font-medium text-blue-600 hover:bg-gray-100 rounded">
                    T
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">
                    ≫
                  </button>
                  <button className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">
                    "
                  </button>
                  <button className="px-2 py-1 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded">
                    B
                  </button>
                  <button className="px-2 py-1 text-sm italic text-gray-600 hover:bg-gray-100 rounded">
                    I
                  </button>
                  <button className="px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded">
                    🔗
                  </button>
                  <button className="px-2 py-1 text-sm underline text-gray-600 hover:bg-gray-100 rounded">
                    U
                  </button>
                  <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                    ⁄
                  </button>
                  <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                    &lt;/&gt;
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                    ≡
                  </button>
                  <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                    ⋮
                  </button>
                  <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                    ⊞
                  </button>
                </div>

                {/* Mock content area */}
                <div className="min-h-16 text-gray-500 text-sm">
                  <div className="w-full h-1 bg-gray-200 rounded mb-2"></div>
                  <div className="w-3/4 h-1 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Quay lại
                </button>
                <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                  Bỏ qua hướng dẫn
                </button>
              </div>
              <button
                onClick={() => handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>

        {/* Content Guide Section */}
        <div className="bg-white rounded-b- xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            PHẦN 2: HỖ TRỢ TRÌNH BÀY BÀI VIẾT CHUYÊN NGHIỆP
          </h2>

          <div className="space-y-4 text-gray-700">
            <h2 className="text-lg font-medium mb-2">Instructions</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Drag elements from the sidebar into the editor area</li>
              <li>Click on elements to edit their content</li>
              <li>Use the toolbar to format your text</li>
              <li>Switch to Preview mode to see how your post will look</li>
              <li>Click Save Post when you're finished</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const Page3 = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header dots indicator */}
        <div className="flex justify-center mb-8 pt-8 ">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Main Editor Tutorial Card */}
        <div className="bg-white rounded-t-2xl shadow-xl border-b-4 border-gray-400">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Hướng dẫn sử dụng Spiderum
              </h1>

              {/* Mock Editor Interface */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Spiderum là gì?
                </h2>

                {/* Mock content area */}
                <div className="min-h-16 text-gray-500 text-sm">
                  <div className="w-full h-1 bg-gray-200 rounded mb-2"></div>
                  <div className="w-3/4 h-1 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Quay lại
                </button>
                <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                  Bỏ qua hướng dẫn
                </button>
              </div>
              <button
                onClick={() => handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>

        {/* Content Guide Section */}
        <div className="bg-white rounded-b- xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            PHẦN 2: HỖ TRỢ TRÌNH BÀY BÀI VIẾT CHUYÊN NGHIỆP
          </h2>

          <div className="space-y-4 text-gray-700">
            <h2 className="text-lg font-medium mb-2">Instructions</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Drag elements from the sidebar into the editor area</li>
              <li>Click on elements to edit their content</li>
              <li>Use the toolbar to format your text</li>
              <li>Switch to Preview mode to see how your post will look</li>
              <li>Click Save Post when you're finished</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const Page4 = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header dots indicator */}
        <div className="flex justify-center mb-8 pt-8 ">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Editor Tutorial Card */}
        <div className="bg-white rounded-t-2xl shadow-xl border-b-4 border-gray-400">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Hướng dẫn sử dụng Spiderum
              </h1>

              {/* Mock Editor Interface */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Spiderum là gì?
                </h2>

                {/* Mock content area */}
                <div className="min-h-16 text-gray-500 text-sm">
                  <div className="w-full h-1 bg-gray-200 rounded mb-2"></div>
                  <div className="w-3/4 h-1 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Quay lại
                </button>
                <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                  Bỏ qua hướng dẫn
                </button>
              </div>
              <button
                onClick={() => handleContinue}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>

        {/* Content Guide Section */}
        <div className="bg-white rounded-b- xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            PHẦN 2: HỖ TRỢ TRÌNH BÀY BÀI VIẾT CHUYÊN NGHIỆP
          </h2>

          <div className="space-y-4 text-gray-700">
            <h2 className="text-lg font-medium mb-2">Instructions</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Drag elements from the sidebar into the editor area</li>
              <li>Click on elements to edit their content</li>
              <li>Use the toolbar to format your text</li>
              <li>Switch to Preview mode to see how your post will look</li>
              <li>Click Save Post when you're finished</li>
            </ul>
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
