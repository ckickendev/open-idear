import { ChevronUp } from "lucide-react";
import "@styles/globals.css";

const Article = ({ title, description, author, time }: any) => {
  return (
    <>
      <div className="col-span-1">
        <div className="h-32 bg-gray-200 rounded overflow-hidden relative">
          <div className="absolute top-2 right-2 bg-blue-600 p-1 rounded">
            <ChevronUp className="text-white" size={16} />
          </div>
          <img
            src="/api/placeholder/200/150"
            alt="Roulette wheel"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="input_con">
          <input className="input" />
        </div>

        <div className="mt-2">
          <div className="text-blue-600 font-semibold text-sm">{title}</div>
          <h3 className="font-bold text-sm">{description}</h3>
          <div className="flex items-center text-xs text-gray-600 mt-1 ">
            <span className="font-medium">{author}</span>
            <span className="mx-1">•</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Article;
