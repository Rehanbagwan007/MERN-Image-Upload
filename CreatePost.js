import axios from 'axios';
import React, { useState } from 'react'
import Avatar from 'react-avatar';
import { CiImageOn } from "react-icons/ci";
import { TWEET_API_END_POINT } from '../utils/constant';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import useGetMyTweets from '../hooks/useGetMyTweets';
import { getisActive, getRefresh } from '../redux/tweetSlice';
import store from '../redux/store';


export const CreatePost = () => {
  const [Description, setDescription] = useState("");
  const [File, setFile] = useState(null); /// empty state to store file in it
  const { user } = useSelector(store => store.user);
  const [previewFile , setpreviewFile] = useState(null)  /// empty state to show for preview
  const dispatch = useDispatch();
  const { isActive } = useSelector(store => store.tweet);

  const handleFileChange = (e) => {  
  

    const selectedFile = e.target.files[0]

    if(selectedFile){
      setFile(selectedFile)
      setpreviewFile(URL.createObjectURL(selectedFile))
    }
  };

  const SubmitHandler = async (e) => {
    e.preventDefault();
        
    const formData = new FormData(); // creating a form for sending data 
    formData.append("description", Description); 
    formData.append("userID", user._id);
    if (File) {
      formData.append("file", File);
    }

    try {
      const post = await axios.post(`${TWEET_API_END_POINT}/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });

      if (post?.data?.success) {
        setDescription("");
        setFile(null);
        setpreviewFile(null)
        toast.success(post.data.message);
        dispatch(getRefresh());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  const followingTweetHandler = () => {
    dispatch(getisActive(true));
  };

  const forYouTweets = () => {
    dispatch(getisActive(false));
  };

  const [prompt, setPrompt] = useState("");

  const HandleChange = (e) => {
    setDescription(e.target.value);
    if (e.target.value.includes("@ai/")) {
      setPrompt(e.target.value);
    } else {
      setPrompt(null);
    }
  };

  const promptSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`http://localhost:8080/api/v1/tweet/tweet-genreate`, { prompt: prompt }, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      if (res?.data?.success) {
        setDescription(res?.data?.generatedPost);
        console.log(Description);
      }
    } catch (err) {
      console.log(err);
    }
  };


  const UnselectHandler = ()=>{
    setFile(null)
    setpreviewFile(null)
  }


  

  return (
    <div className='w-[100%] md:w-[100%] h-full sticky top-0 bg-white dark:bg-black'>
      <div className="w-full h-full flex flex-col">
        <div className='flex items-center justify-evenly border-b '>
          <div onClick={forYouTweets} className='cursor-pointer hover:bg-gray-200 w-full text-center px-3 py-4 rounded'>
            <h1 className="font-bold text-gray-600 dark:text-white">
              <span className={`${isActive ? "border-b-4 border-transparent" : "border-b-4 border-blue-600"} cursor-pointer hover:bg-gray-200 w-full text-center px-4 py-3`}>For You</span>
            </h1>
          </div>
          <div onClick={followingTweetHandler} className='cursor-pointer hover:bg-gray-200 w-full text-center px-3 py-4 rounded'>
            <h1 className='font-bold text-gray-600 dark:text-white'>
              <span className={`${isActive ? "border-b-4 border-blue-600" : "border-b-4 border-transparent"} cursor-pointer hover:bg-gray-200 w-full text-center px-4 py-3`}>Following</span>
            </h1>
          </div>
        </div>

        <div className='flex'>
          <div className='flex flex-row items-center p-3'>
            <div>
              <Avatar src='https://img.freepik.com/premium-photo/young-male-cartoon-developer-coding-badass-black-short_1057389-529.jpg?w=740' googleId="118096717852922241760" size="40" round={true} />
            </div>
          </div>
          <textarea type='text' className={`w-full p-2 outline-none text-lg dark:bg-black ${prompt ? "text-green-600 font-semibold" : ""}`} placeholder='Use @ai/ to generate' value={Description} onChange={HandleChange}></textarea>
        </div>

        <div className='flex justify-between items-center border-b border-gray-300 p-1.5'>
          <div className='ml-3'>
            <label htmlFor="file-upload" className="cursor-pointer">
              <CiImageOn className='text-blue-600' size={'25px'} />
            </label>
            <input id="file-upload" type='file' accept="image/*, video/*" className="hidden" onChange={handleFileChange} />
            <img src={previewFile}  className='w-auto h-auto' />
          </div>

          <div className='flex flex-row items-center gap-2'>
            <button className='bg-blue-500 rounded-full px-4 py-2 text-white' onClick={SubmitHandler}>Post</button>
            {File  && (
              <button className='bg-red-500 rounded-full px-4 py-2 text-white' onClick={UnselectHandler}>Unselect</button>

            )}
            
            {prompt && (
              <button className='bg-green-500 rounded-full px-4 py-2 text-white' onClick={promptSubmitHandler}>Generate</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
