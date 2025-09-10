"use client";
import { Sidebar } from "./Sidebar";
import { Gallery } from "./Gallery";
import {
  FullyEnrichedProject,
  EnrichedProjectMaterials,
} from "@/types/dashboard";
import VoteButton from "./VoteButton";

export default function Lightbox({
  images,
  open,
  onClose,
  materials,
  title,
  project,
  votes,
  setVotes,
}: Props) {
  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        className="absolute top-4 right-6 text-3xl text-white"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>

      <div className=" bg-white rounded-lg shadow-lg w-[90vw] h-[85vh] flex flex-col">
        <div className="flex flex-row items-center max-h-fit p-4 justify-between">
          <h2 className="text-md sm:text-2xl font-extrabold pr-4">{title}</h2>
          <VoteButton projectId={project.id} setVotes={setVotes} antdAdjustment={true} />
        </div>
        <div className="flex sm:flex-row flex-col-reverse flex-1 h-0 justify-around">
          <div className="h-1/4 sm:h-full w-full sm:w-1/3 sm:max-w-[320px] overflow-y-auto">
            <Sidebar materials={materials} project={project} />
          </div>
          <div className="h-3/4 sm:h-full sm:w-2/3 flex mb-2 sm:mb-0">
            <Gallery images={images} />
          </div>
        </div>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Votes: {votes}</div>
          </div>
        </div>
      </div>
    </div>
  );

}

type Props = {
  images: string[];
  open: boolean;
  initialIndex?: number;
  onClose: () => void;
  materials: EnrichedProjectMaterials;
  title: string;
  project: FullyEnrichedProject;
  votes: number;
  setVotes: React.Dispatch<React.SetStateAction<number>>;
};
