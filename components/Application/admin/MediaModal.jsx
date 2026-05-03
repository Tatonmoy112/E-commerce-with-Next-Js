import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import loading from "@/public/assets/images/loading.svg";
import ModalMediaBlock from "./ModalMediaBlock";
import { showToast } from "@/lib/showtoast";
import { ButtonLoading } from "../ButtonLoading";
import UploadMedia from "./UploadMedia";
import { useQueryClient } from "@tanstack/react-query";

const MediaModal = ({
  open,
  setOpen,
  selectedMedia,
  setSelectedMedia,
  isMultiple,
}) => {
  const queryClient = useQueryClient();
  const [previouslySelected, setPreviouslySelected] = useState([]);

  const fetchMedia = async (page) => {
    const { data: response } = await axios.get(
      `/api/media?page=${page}&limit=18&&deleteType=SD`
    );
    return response;
  };
  const {
    isPending,
    isError,
    error,
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["MediaModal"],
    queryFn: async ({ pageParam }) => await fetchMedia(pageParam),
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return lastPage.hasMore ? nextPage : undefined;
    },
  });

  const handleClear = () => {
    setSelectedMedia([]);
    setPreviouslySelected([]);
    showToast("success", "Media selection clear");
  };
  const handleClose = () => {
    setSelectedMedia(previouslySelected);
    setOpen(false);
  };
  const handleSelect = () => {
    if (selectedMedia.length <= 0) {
      return showToast("error", "Please select a media");
    }
    setPreviouslySelected(selectedMedia);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[80%] h-screen p-0 py-10 bg-transparent border-0 shadow-none"
      >
        <DialogDescription className="hidden"></DialogDescription>
        <div className="h-[90vh] bg-white dark:bg-card p-3 rounded shadow flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b pb-3 mb-2 text-black dark:text-white">
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="text-xl font-bold">Media Selection</DialogTitle>
              <UploadMedia 
                isMultiple={isMultiple} 
                queryClient={queryClient} 
                invalidateKeys={["MediaModal"]} 
              />
            </div>
          </DialogHeader>

          <div className="flex-grow overflow-auto py-2 custom-scrollbar">
            {isPending ? (
              <div className="size-full flex justify-center items-center">
                <Image src={loading} alt="loading" height={80} width={80} />
              </div>
            ) : isError ? (
              <div className="size-full flex justify-center items-center">
                <span className="text-red-500"> {error.message}</span>
              </div>
            ) : (
              <>
                <div className="grid lg:grid-cols-6 grid-cols-3 gap-3">
                  {data?.pages?.map((page, index) => (
                    <React.Fragment key={index}>
                      {page?.mediaData?.map((media) => (
                        <ModalMediaBlock
                          key={media.id}
                          media={media}
                          selectedMedia={selectedMedia}
                          setSelectedMedia={setSelectedMedia}
                          isMultiple={isMultiple}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                {hasNextPage ? (
                  <div className="flex justify-center py-8">
                    <ButtonLoading
                      type="button"
                      onClick={() => fetchNextPage()}
                      loading={isFetching}
                      text="Load More"
                    />
                  </div>
                ) : (
                  <p className="text-center py-10 text-gray-500 font-medium italic">Nothing more to Load</p>
                )}
              </>
            )}
          </div>

          <div className="flex-shrink-0 pt-3 border-t flex justify-between items-center mt-auto">
            <div>
              <Button type="button" variant="destructive" className="px-6" onClick={handleClear}>
                Clear All
              </Button>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="px-6" onClick={handleClose}>
                Close
              </Button>
              <Button type="button" className="px-10 font-bold" onClick={handleSelect}>
                Select
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaModal;
