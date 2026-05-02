"use client";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/showtoast";
import axios from "axios";
import { CldUploadWidget } from "next-cloudinary";
import { FiPlus } from "react-icons/fi";

const UploadMedia = ({ isMultiple, queryClient }) => {
  const handleOnError = (error) => {
    showToast("error", error.statusText);
  };
  const handleOnQueueEnd = async (results) => {
    const files = results.info.files;

    const uploadedFiles = files
      .filter((file) => file.uploadInfo)
      .map((file) => {
        const info = file.uploadInfo;

        const secureUrl = info.secure_url
          ? info.secure_url
          : info.url?.replace("http://", "https://");

        return {
          asset_id: info.asset_id,
          public_id: info.public_id,
          secure_url: secureUrl,
          path: info.path, // usually public_id path
          thumbnail_url: secureUrl, // or your custom transformation
        };
      });

    if (uploadedFiles.length > 0) {
      try {
        const data = await axios.post("/api/media/create", uploadedFiles);
        if (!data.data.success) {
          throw new Error(data.data.message);
        }
        queryClient.invalidateQueries(["media-data"]);
        showToast("success", data.data.message);
      } catch (error) {
        showToast("error", error.message);
      }
    }
  };

  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary-signature"
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPDATE_PRESET}
      onError={handleOnError}
      onQueuesEnd={handleOnQueueEnd}
      config={{
        cloud: {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        },
      }}
      options={{
        sources: ["local", "url", "unsplash", "google_drive"],
        multiple: isMultiple,
      }}
    >
      {({ open }) => {
        return (
          <Button onClick={() => open()}>
            <FiPlus />
            Upload Media
          </Button>
        );
      }}
    </CldUploadWidget>
  );
};

export default UploadMedia;
