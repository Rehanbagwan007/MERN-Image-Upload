# MERN-Image-Upload
Learn how to Image in Mern Stack App using Multer and Cloudinary

Go To Cloudinary Set Up Your Acount get api key And Follow The Code

# Cloudinary Image Upload & Preview (Twitter Clone)

This guide explains how to **upload images to Cloudinary** from the frontend, **preview the selected image**, and handle the backend upload process step by step. 

---

## 1️⃣ Frontend: Selecting & Previewing Image (CreatePost.js)

```javascript
import { useState } from 'react';
import axios from 'axios';
import Avatar from 'react-avatar';
import { CiImageOn } from "react-icons/ci";
import { TWEET_API_END_POINT } from '../utils/constant';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getRefresh } from '../redux/tweetSlice';

export const CreatePost = () => {
  const [Description, setDescription] = useState("");
  const [File, setFile] = useState(null); /// Stores the selected file
  const [Preview, setPreview] = useState(null); /// Stores image preview URL
  const { user } = useSelector(store => store.user);
  const dispatch = useDispatch();

  /// Function to handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file)); /// Generate preview URL
    }
  };

  /// Function to handle tweet submission
  const SubmitHandler = async (e) => {
    e.preventDefault();
    if (!Description && !File) {
      return toast.error("Please enter a description or upload a file");
    }

    const formData = new FormData(); /// FormData allows sending files
    formData.append("description", Description);
    formData.append("userID", user._id);
    if (File) formData.append("file", File); /// Attach file if selected

    try {
      const post = await axios.post(`${TWEET_API_END_POINT}/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      
      if (post?.data?.success) {
        setDescription("");
        setFile(null);
        setPreview(null);
        toast.success("Tweet created successfully!");
        dispatch(getRefresh());
      }
    } catch (err) {
      toast.error("Error uploading tweet");
    }
  };

  return (
    <div className='w-full md:w-full h-full sticky top-0 bg-white dark:bg-black'>
      <div className='flex'>
        <Avatar src={user?.profilePic} size='40' round={true} />
        <textarea 
          className='w-full p-2 outline-none text-lg dark:bg-black' 
          placeholder='What’s happening?'
          value={Description} 
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className='flex justify-between items-center border-b p-1.5'>
        <input id='file-upload' type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
        <label htmlFor='file-upload'>
          <CiImageOn className='text-blue-600' size={'25px'} />
        </label>
        {Preview && <img src={Preview} alt='Preview' className='h-20 w-20 object-cover' />} /// Shows selected image preview
        <button className='bg-blue-500 rounded-full px-4 py-2 text-white' onClick={SubmitHandler}>Post</button>
      </div>
    </div>
  );
};
```

---

## 2️⃣ Backend: Handling File Upload with Multer

### Multer Setup (middlewares/multer.js)
```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'public', 'temp'); /// Save files temporarily before Cloudinary upload
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });
```

---

## 3️⃣ Cloudinary Configuration (config/cloudinary.js)
```javascript
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/// Configure Cloudinary (replace with your actual credentials)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/// Function to upload files to Cloudinary
export const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const res = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    console.log("File uploaded to Cloudinary:", res.secure_url);

    fs.unlinkSync(localFilePath); /// Delete local temp file after upload
    return res;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    fs.unlinkSync(localFilePath); /// Cleanup failed uploads
  }
};
```

---

## 4️⃣ Backend: Handling Tweet Creation (controllers/tweetController.js)
```javascript
import { uploadCloudinary } from '../config/cloudinary.js';
import tweetModel from '../models/tweetModel.js';
import userModel from '../models/userModel.js';

export const createTweet = async (req, res) => {
  try {
    const { description, userID } = req.body;
    let mediaUrl = null;

    if (!description && !req.file) {
      return res.status(400).json({ message: "Fields are required", success: false });
    }

    if (req.file) {
      const cloudinaryResponse = await uploadCloudinary(req.file.path);
      mediaUrl = cloudinaryResponse.secure_url;
    }

    const tweet = await tweetModel.create({ description, userID, mediaUrl });
    await userModel.findByIdAndUpdate(userID, { $push: { tweets: tweet._id } }, { new: true });

    return res.status(201).json({ message: "Tweet created successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};
```

---

## 5️⃣ Routes (routes/tweetRoutes.js)
```javascript
import express from 'express';
import { createTweet } from '../controllers/tweetController.js';
import { authentication } from '../config/auth.js';
import { upload } from '../middlewares/multer.js';

const tweetRouter = express.Router();

tweetRouter.post("/create", authentication, upload.single("file"), createTweet);

export default tweetRouter;
```

---

### ✅ Summary
1. **Frontend:** Users select an image, preview it, and submit a tweet.
2. **Backend:** Multer saves the file temporarily, Cloudinary uploads it, and the URL is stored.
3. **Database:** Tweet is created with description and media URL.

Now you have a **fully functional file upload system** with Cloudinary! 🚀
