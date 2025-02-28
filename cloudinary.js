import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name: 'ddpkr1nhe', 
    api_key: '961833448399294', 
    api_secret: '5PrmbJHM9hAReJQTk-ucdVdNGVs' // Click 'View API Keys' above to copy your API secret
});


export const uploadCloudinary = async (localFilePath)=>{
    try {
          
        if(!localFilePath) return null

        const res = await cloudinary.uploader.upload(localFilePath , {
            resource_type: "auto"
        })

        console.log("file is upload on cloudinary " , res.url);
        

         return res

        
    } catch (error) {
         fs.unlinkSync(localFilePath)
     
        console.log(error);
        
    }
}