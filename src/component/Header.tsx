"use client"
import { useState } from "react"
import { LoginPage } from "./authen/Login";


export default function Header() {
  const [isAuthenFormDisplay, setIsAuthenFromDisplay] = useState(false);

  return <header className='flex border-b border-gray-300 py-3 px-4 sm:px-10 bg-white min-h-[65px] tracking-wide relative z-50'>
    <div className='flex flex-wrap items-center gap-4 max-w-screen-xl mx-auto w-full'>
      <a href="javascript:void(0)" className="max-sm:hidden"><img src="https://readymadeui.com/readymadeui.svg" alt="logo" className='w-[134px]' />
      </a>
      <a href="javascript:void(0)" className="hidden max-sm:block"><img src="https://readymadeui.com/readymadeui-short.svg" alt="logo" className='w-8' />
      </a>

      <div id="collapseMenu"
        className='max-lg:hidden lg:!block max-lg:w-full max-lg:fixed max-lg:before:fixed max-lg:before:bg-black max-lg:before:opacity-50 max-lg:before:inset-0 max-lg:before:z-50'>
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

      <div className='flex flex-1 gap-4 ml-auto'>
        <div
          className='flex max-w-xs w-full bg-gray-100 px-4 py-2.5 outline outline-transparent border border-gray-300 focus-within:border-gray-300 focus-within:bg-transparent transition-all'>
          <input type='text' placeholder='Search something...'
            className='w-full text-sm bg-transparent outline-none pr-2' />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="16px"
            className="cursor-pointer fill-gray-400">
            <path
              d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
            </path>
          </svg>
        </div>
        <div className="flex flex-row ">
          <button type="button" className="cursor-pointer focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-xl text-sm px-5 py-2.5 m-2  dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" onClick={() => setIsAuthenFromDisplay(true)}>Get Started</button>
          {/* <button type="button" className="cursor-pointer focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-xl text-sm px-5 py-2.5 me-2 m-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Login</button> */}
        </div>
      </div>

      {isAuthenFormDisplay ? <LoginPage setIsAuthenFromDisplay={setIsAuthenFromDisplay} /> : <></>}
    </div>
  </header>
}