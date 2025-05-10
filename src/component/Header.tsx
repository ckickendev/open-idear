"use client"
import { useEffect, useState } from "react"
import { AuthenPage } from "./authen/AuthenPage";
import Profile from "./authen/Profile";
import axios from "axios";
import { getHeadersToken } from "@/api/authentication";
import { set } from "react-hook-form";
import authenFormStore from "@/store/AuthenFormStore";
import authenticationStore from "@/store/AuthenticationStore";


export default function Header() {
  const isAuthenFormDisplay = authenFormStore((state) => state.isAuthenFormDisplay);
  const setIsAuthenFromDisplay = authenFormStore((state) => state.setIsAuthenFromDisplay);
  const setStateAuthen = authenFormStore((state) => state.setState);

  const authenUser = authenticationStore((state) => state.currentUser);


  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        const headers = getHeadersToken();

        const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}auth/getProfile`, { headers });
        if (res.status === 200) {
          console.log("User info: ", res.data.userInfo);

          authenticationStore.setState({ currentUser: res.data.userInfo });
        }
      }
    };
    fetchUser();
  }, []);


  return <header className='flex border-b border-gray-300 py-3 px-4 sm:px-10 bg-white tracking-wide relative z-50'>
    <div className='flex flex-row flex-nowrap items-center gap-4 max-w-screen-xl mx-auto w-full'>
      <div className="flex items-center flex-1">
        <a href="#" className="max-sm:hidden"><img src="https://res.cloudinary.com/dhc6z8uix/image/upload/v1743690388/wik95ksifmrudkbfmzom.png" alt="logo" className='w-[134px]' />
        </a>
        <h1 className="text-2xl font-semibold text-blue-600 flex items-center justify-center">
          <span className="text-3xl font-bold">Open</span>
          IdeaR
        </h1>
      </div>


      <div id="collapseMenu"
        className='flex-1 max-lg:hidden lg:!block max-lg:w-full max-lg:fixed max-lg:before:fixed max-lg:before:bg-black max-lg:before:opacity-50 max-lg:before:inset-0 max-lg:before:z-50'>
        <ul
          className='lg:flex lg:ml-14 lg:gap-x-5 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50'>
          <li className='mb-6 hidden max-lg:block'>
            <a href="javascript:void(0)"><img src="https://readymadeui.com/readymadeui.svg" alt="logo" className='w-36' />
            </a>
          </li>
          <li className='max-lg:border-b max-lg:py-3 px-3'>
            <a href='javascript:void(0)'
              className='font-medium lg:hover:text-blue-700 text-blue-700 block text-[15px]'>Home</a>
          </li>
          <li className='max-lg:border-b max-lg:py-3 px-3'><a href='javascript:void(0)'
            className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>Team</a>
          </li>
          <li className='max-lg:border-b max-lg:py-3 px-3'><a href='javascript:void(0)'
            className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>Feature</a>
          </li>
          <li className='max-lg:border-b max-lg:py-3 px-3'><a href='javascript:void(0)'
            className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>Blog</a>
          </li>
          <li className='max-lg:border-b max-lg:py-3 px-3'><a href='javascript:void(0)'
            className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>About</a>
          </li>
        </ul>
      </div>

      <div className='flex flex-1 items-center justify-center gap-4 ml-auto'>
        <form action="https://tailwindflex.com/search" className="flex flex-1 relative w-[300px]">
          <input className="pr-10 input w-full rounded-lg pt-2 pb-2 pl-2 border border-gray-500 focus:outline-none focus:border-red-500" type="search" name="q" placeholder="Search" />

          <button type="submit" className="absolute top-0 right-0 mt-3 mr-4 text-gray-400 dark:text-gray-200">
            <span className="sr-only">Search</span>
            <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 56.966 56.966" xmlSpace="preserve">
              <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"></path>
            </svg>
          </button>
        </form>
        {authenUser?._id ? <Profile /> :
          <div className="flex flex-row">
            <button type="button" className="cursor-pointer focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-xl text-sm px-5 py-2.5 m-2  dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" onClick={() => {
              setIsAuthenFromDisplay(true)
              setStateAuthen(2);
            }}>Get Started</button>
            <button type="button" className="cursor-pointer focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-xl text-sm px-5 py-2.5 me-2 m-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" onClick={() => {
              setIsAuthenFromDisplay(true);
              setStateAuthen(1);
            }}>Login</button>
          </div>
        }

      </div>

      {isAuthenFormDisplay ? <AuthenPage /> : <></>}
    </div>
  </header>
}