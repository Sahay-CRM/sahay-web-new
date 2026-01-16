import { useMutation } from "@tanstack/react-query";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";

interface TranscriptSentence {
  text: string;
  speaker_name: string | null;
  start_time: number;
  end_time: number;
}

interface TranscriptResponse {
  title: string;
  date: number;
  duration: number;
  sentences: TranscriptSentence[];
  summary: string | null;
}

export default function useGetTranscript(transcriptId: string) {
  return useMutation({
    mutationKey: ["transcript"],
    mutationFn: async () => {
      const { data: resData } = await Api.post<TranscriptResponse>({
        url: Urls.GetTranscript(transcriptId),
      });

      return resData;
    },
  });
}
