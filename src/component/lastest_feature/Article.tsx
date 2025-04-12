import { ChevronUp } from "lucide-react";
import "@styles/globals.css";
import Logo from "../common/Logo";

const Article = ({ category, description, author, time, image }: any) => {
  return (
    <>
      <div className="col-span-1 h-full border-b-1 border-gray-300 pt-4 pb-4">
        <div className="h-32 bg-gray-200 rounded overflow-hidden relative">
          <div className="absolute top-2 right-2 p-1 rounded">
            <Logo />
          </div>
          <img
            src={image}
            alt="Roulette wheel"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-2">
          <div className="text-blue-600 font-semibold text-sm cursor-pointer hover:underline">
            {category}
          </div>
          <h3 className="font-bold text-sm cursor-pointer hover:underline">{description}</h3>
          <div className="flex items-center text-xs text-gray-600 dark:text-white mt-1 ">
            <span className="font-medium cursor-pointer hover:underline">{author}</span>
            <span className="mx-1">•</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Article;
