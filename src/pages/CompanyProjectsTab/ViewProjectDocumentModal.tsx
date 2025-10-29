import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { FileText, Loader2, Save, Trash2 } from "lucide-react";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";

interface ViewProjectDocsModalProps {
  isModalOpen: boolean;
  modalData: {
    projectId?: string;
    projectDocuments?: {
      fileId: string;
      fileName: string;
    }[];
  } | null;
  modalClose: () => void;
}

export const ViewProjectDocsModal: React.FC<ViewProjectDocsModalProps> = ({
  isModalOpen,
  modalData,
  modalClose,
}) => {
  const { mutate: docUpload } = docUploadMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [docs, setDocs] = useState(modalData?.projectDocuments || []);

  // keep modalData synced if parent changes
  useEffect(() => {
    setDocs(modalData?.projectDocuments || []);
  }, [modalData]);

  // 📥 Download file
  const handleDownload = (fileName: string) => {
    const fileUrl = `${ImageBaseURL}/share/pDocs/${fileName}`;
    window.open(fileUrl, "_blank");
  };

  // 🗑️ Remove file (docUpload API)
  const handleRemoveFile = (fileId: string) => {
    setLoadingId(fileId);

    const formData = new FormData();
    formData.append("refId", modalData?.projectId || "");
    formData.append("imageType", "PROJECT");
    formData.append("isMaster", "0");
    formData.append("removedFiles", fileId);

    docUpload(formData, {
      onSuccess: () => {
        setDocs((prev) => prev.filter((d) => d.fileId !== fileId));
        queryClient.resetQueries({
          queryKey: ["get-project-by-id", modalData?.projectId],
        });
      },
      onSettled: () => setLoadingId(null),
    });
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalClose={modalClose}
      modalTitle="Project Documents"
      containerClass="max-h-[500px] min-w-[35%] "
      childclass="px-6 py-0 pb-4 "
    >
      {docs.length > 0 ? (
        <div className=" flex flex-col gap-2">
          {/* <p className="text-sm text-gray-600 mb-2">
            {docs.length} file(s) available
          </p> */}

          {docs.map((file) => (
            <div
              key={file.fileId}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="font-medium truncate text-sm text-gray-800 max-w-[500px]">
                  {file.fileName}
                </span>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  className=" px-2 py-1  text-white rounded text-xs hover:bg-gray-200 cursor-pointer
                   transition"
                  onClick={() => handleDownload(file.fileName)}
                  title="Dewnload"
                >
                  <Save className="w-4 h-4 text-primary" />
                </button>

                <button
                  type="button"
                  disabled={loadingId === file.fileId}
                  className=" px-2 py-1   rounded text-xs cursor-pointer hover:bg-gray-200 transition flex items-center gap-1"
                  onClick={() => handleRemoveFile(file.fileId)}
                  title="Remove"
                >
                  {loadingId === file.fileId ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </>
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-sm py-10">
          No documents available
        </div>
      )}
    </ModalData>
  );
};
