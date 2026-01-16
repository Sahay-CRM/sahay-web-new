/* eslint-disable no-console */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { get, onValue, ref, remove, update } from "firebase/database";
import { database } from "@/firebaseConfig";

import { queryClient } from "@/queryClient";
import {
  addMeetingNotesMutation,
  addUpdateDetailMeetingMutation,
  deleteCompanyMeetingMutation,
  updateDetailMeetingMutation,
  useGetMeetingNotes,
  useGetMeetingTiming,
} from "@/features/api/detailMeeting";
import { docUploadMutation } from "@/features/api/file";
import { toast } from "sonner";

export default function useMeetingDesc() {
  const { id: meetingId } = useParams();
  // const sidebarControl = useContext(SidebarControlContext);
  // const userData = useSelector(getUserDetail);

  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<string>();
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [openEmployeeId, setOpenEmployeeId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [canStopRecording, setCanStopRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecordingLocally, setIsRecordingLocally] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const { data: meetingData } = useGetMeetingTiming(meetingId ?? "");

  const meetingTiming = meetingData?.data as
    | CompanyMeetingDataProps
    | undefined;

  const isActiveTab = activeTab === "UPDATES" || activeTab === "APPRECIATION";

  const { data: meetingNotes } = useGetMeetingNotes({
    filter: {
      meetingId: meetingTiming?.meetingId,
      ...((activeTab === "UPDATES" || activeTab === "APPRECIATION") && {
        noteType: activeTab,
      }),
      ...(meetingTiming?.repetitiveMeetingId && {
        repetitiveMeetingId: meetingTiming.repetitiveMeetingId,
      }),
    },
    enable: !!meetingTiming?.meetingId && !!activeTab && isActiveTab,
  });

  const { mutate: updateDetailMeeting } = updateDetailMeetingMutation();
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();

  const { mutate: addDetailMeeting } = addUpdateDetailMeetingMutation();
  const { mutate: uploadDoc } = docUploadMutation();

  const handleUpdatedRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["get-meeting-details-timing"],
      }),
    ]);
  }, []);

  const db = database;

  const hasStartedTriggered = useRef(false);

  useEffect(() => {
    const meetingRef = ref(db, `meetings/${meetingId}`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      setMeetingResponse(data);

      const isStarted =
        data.state?.status === "IN_PROGRESS" ||
        meetingTiming?.detailMeetingStatus === "STARTED";

      // ⭐ RUN ONLY ONE TIME WHEN STARTED
      if (isStarted && !hasStartedTriggered.current) {
        hasStartedTriggered.current = true;
        setActiveTab("DOCUMENTS");
        setIsCardVisible(true);
      }
    });

    return () => unsubscribe();
  }, [db, meetingId, meetingTiming?.detailMeetingStatus]);

  useEffect(() => {
    if (!meetingId || !db) return;

    const activeTabRef = ref(db, `meetings/${meetingId}/state/activeTab`);
    const statusRef = ref(db, `meetings/${meetingId}/state/status`);

    const filter = { meetingId };

    const unsubActiveTabImmediate = onValue(activeTabRef, (snapshot) => {
      if (!meetingResponse) return;
      if (snapshot.exists()) {
        const activeTab = snapshot.val();

        handleUpdatedRefresh();
        if (activeTab === "CONCLUSION") {
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-res"],
          });
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-time-by-meetingId"],
          });
        } else if (activeTab === "ENDED") {
          handleUpdatedRefresh();
        }
      }
    });

    const unsubActiveTabDelayed = onValue(activeTabRef, (snapshot) => {
      let timer: NodeJS.Timeout;

      if (snapshot.exists()) {
        const activeTab = snapshot.val();

        timer = setTimeout(() => {
          if (activeTab === "CONCLUSION") {
            queryClient.resetQueries({
              queryKey: ["get-meeting-conclusion-res"],
            });
            queryClient.resetQueries({
              queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
            });
          } else if (activeTab === "ENDED") {
            handleUpdatedRefresh();
          }
        }, 2000);
      } else {
        timer = setTimeout(() => {
          handleUpdatedRefresh();
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-res"],
          });
        }, 1000);
      }

      return () => clearTimeout(timer);
    });

    const unsubStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const activeTab = snapshot.val();
        if (activeTab === "IN_PROGRESS") {
          queryClient.resetQueries({
            queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
          });
        } else if (activeTab === "ENDED") {
          handleUpdatedRefresh();
        }
      } else {
        handleUpdatedRefresh();
      }
      queryClient.resetQueries({ queryKey: ["get-meeting-conclusion-res"] });
    });

    return () => {
      unsubActiveTabImmediate();
      unsubActiveTabDelayed();
      unsubStatus();
    };
  }, [db, handleUpdatedRefresh, meetingId, meetingResponse]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecordingLocally) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecordingLocally]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab((prevTab) => {
      if (prevTab === tab) {
        setIsCardVisible((prev) => !prev);
        return tab;
      } else {
        setIsCardVisible(true);
        return tab;
      }
    });
  }, []);

  const handleConclusionMeeting = () => {
    if (meetingId) {
      const db = database;
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

      updateDetailMeeting(
        {
          meetingId: meetingId,
          detailMeetingStatus: "CONCLUSION",
        },
        {
          onSuccess: () => {
            update(meetStateRef, {
              activeTab: "CONCLUSION",
              lastSwitchTimestamp: Date.now(),
              status: "CONCLUSION",
            });
          },
        },
      );
    }
  };

  const handleAddTeamLeader = async (data: Joiners) => {
    if (
      meetingTiming?.detailMeetingStatus === "NOT_STARTED" ||
      meetingTiming?.detailMeetingStatus === "ENDED"
    ) {
      const meetingJoiners = meetingTiming?.joiners;
      const teamLeader = (meetingJoiners as Joiners[])
        ?.filter((da) => da.isTeamLeader)
        .map((item) => item.employeeId);

      let updatedTeamLeaders: string[];
      if (teamLeader?.includes(data.employeeId)) {
        updatedTeamLeaders = teamLeader.filter((id) => id !== data.employeeId);
      } else {
        updatedTeamLeaders = [...(teamLeader || []), data.employeeId];
      }

      const payload = {
        meetingId: meetingId,
        teamLeaders: updatedTeamLeaders,
      };
      addDetailMeeting(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-details-timing"],
          });
        },
      });
    } else {
      const meetRef = ref(db, `meetings/${meetingId}/state`);
      const meetingSnapshot = await get(meetRef);

      const meetingJoiners = meetingTiming?.joiners;
      const teamLeader = (meetingJoiners as Joiners[])
        ?.filter((da) => da.isTeamLeader)
        .map((item) => item.employeeId);

      let updatedTeamLeaders: string[];
      if (teamLeader?.includes(data.employeeId)) {
        updatedTeamLeaders = teamLeader.filter((id) => id !== data.employeeId);
      } else {
        updatedTeamLeaders = [...(teamLeader || []), data.employeeId];
      }

      const payload = {
        meetingId: meetingId,
        teamLeaders: updatedTeamLeaders,
      };
      addDetailMeeting(payload, {
        onSuccess: () => {
          if (!meetingSnapshot.exists()) {
            queryClient.invalidateQueries({
              queryKey: ["get-meeting-details-timing"],
            });
            return;
          } else {
            update(meetRef, {
              updatedAt: Date.now(),
            });
          }
        },
      });
    }
  };

  const handleFollow = (employeeId: string) => {
    if (meetingId) {
      const meetRef = ref(db, `meetings/${meetingId}/state`);
      update(meetRef, {
        follow: employeeId,
        updatedAt: Date.now(),
      });
    }
  };

  const handleUnFollow = (employeeId: string) => {
    if (meetingId) {
      const meetRef = ref(db, `meetings/${meetingId}/state/unfollow`);
      update(meetRef, {
        [employeeId]: true,
      });
    }
  };

  const handleFollowBack = (employeeId: string) => {
    if (meetingId) {
      const employeeRef = ref(
        db,
        `meetings/${meetingId}/state/unfollow/${employeeId}`,
      );
      remove(employeeRef);
    }
  };

  const handleCheckIn = (employeeId: string, attendanceMark: boolean) => {
    if (meetingId) {
      addDetailMeeting(
        {
          meetingId: meetingId,
          employeeId: employeeId,
          attendanceMark: attendanceMark,
        },
        {
          onSuccess: () => {
            if (meetingId) {
              const db = database;
              const meetRef = ref(db, `meetings/${meetingId}/state`);
              update(meetRef, { updatedAt: new Date() });
            }
          },
        },
      );
    }
  };

  const handleUpdateNotes = (data: MeetingNotesRes) => {
    const payload = {
      meetingNoteId: data.meetingNoteId,
      noteType: null,
    };
    addNote(payload, {
      onSuccess: () => {},
    });
  };

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleAddEmp = async (data: EmployeeDetails[]) => {
    if (
      meetingTiming?.detailMeetingStatus === "NOT_STARTED" ||
      meetingTiming?.detailMeetingStatus === "ENDED"
    ) {
      const payload = {
        meetingId: meetingId,
        joiners: [
          ...(data?.map((item) => item.employeeId) || []),
          ...((meetingTiming.joiners as Joiners[])?.map(
            (em) => em.employeeId,
          ) || []),
        ],
      };
      addDetailMeeting(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-details-timing"],
          });
        },
      });
    } else {
      const meetingRef = ref(db, `meetings/${meetingId}`);
      const meetingSnapshot = await get(meetingRef);
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

      if (meetingId && meetingTiming?.meetingId) {
        const payload = {
          meetingId: meetingId,
          joiners: [
            ...(data?.map((item) => item.employeeId) || []),
            ...((meetingTiming.joiners as Joiners[])?.map(
              (em) => em.employeeId,
            ) || []),
          ],
        };
        addDetailMeeting(payload, {
          onSuccess: () => {
            if (!meetingSnapshot.exists()) {
              queryClient.invalidateQueries({
                queryKey: ["get-meeting-details-timing"],
              });
              return;
            }
            update(meetStateRef, {
              updatedAt: Date.now(),
            });
          },
        });
      }
    }
  };

  const handleDeleteEmp = async (employeeId: string) => {
    if (
      meetingTiming?.detailMeetingStatus === "NOT_STARTED" ||
      meetingTiming?.detailMeetingStatus === "ENDED"
    ) {
      const joiners = (meetingTiming?.joiners as Joiners[])
        ?.filter((item) => item.employeeId !== employeeId)
        ?.map((item) => item.employeeId);

      const payload = {
        meetingId: meetingId,
        joiners: joiners,
      };
      addDetailMeeting(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["get-meeting-details-timing"],
          });
        },
      });
    } else {
      const meetingRef = ref(db, `meetings/${meetingId}`);
      const meetingSnapshot = await get(meetingRef);
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);

      const joiners = (meetingTiming?.joiners as Joiners[])
        ?.filter((item) => item.employeeId !== employeeId)
        ?.map((item) => item.employeeId);

      if (meetingId && meetingTiming?.meetingId) {
        const payload = {
          meetingId: meetingId,
          joiners: joiners,
        };
        addDetailMeeting(payload, {
          onSuccess: () => {
            if (!meetingSnapshot.exists()) {
              queryClient.invalidateQueries({
                queryKey: ["get-meeting-details-timing"],
              });
              return;
            }
            update(meetStateRef, {
              updatedAt: Date.now(),
            });
          },
        });
      }
    }
  };

  useEffect(() => {
    const db = database;
    const meetingRef = ref(db, `meetings/${meetingId}/state/updatedAt`);

    const unsubscribe = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.invalidateQueries({
          queryKey: ["get-meeting-details-timing"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get-meeting-notes"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get-detail-meeting-obj-issue"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get-detail-meeting-agenda-issue-obj"],
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [meetingId]);

  useEffect(() => {
    const db = database;
    const meetingRef = ref(db, `meetings/${meetingId}/alert/updatedAt`);

    const audio = new Audio("/BackToWork.mp3");
    const RingAlert = onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        audio.play();
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          remove(meetingRef).catch((err) => {
            toast(err);
          });
        }, 600);
      }
    });
    return () => RingAlert();
  }, [meetingId]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  const isRecording = useMemo(
    () => !!meetingResponse?.state?.isRecording,
    [meetingResponse],
  );

  useEffect(() => {
    if (
      !isRecording &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecordingLocally(false);
    }
  }, [isRecording]);
  useEffect(() => {
    console.log("canStopRecording:", canStopRecording);
  }, [canStopRecording]);

  const downloadRecordingLocally = (blob: Blob, fileName: string) => {
    try {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Recording downloaded locally as MP3!");
    } catch (error) {
      console.error("Error downloading recording:", error);
      toast.error("Failed to download recording locally");
    }
  };

  const convertWebmToMp3 = async (webmBlob: Blob): Promise<Blob> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      try {
        // Create a temporary audio element to convert
        const audioContext = new AudioContext();
        const arrayBuffer = await webmBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Create WAV format (simplest conversion)
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length * numberOfChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);

        // Write WAV header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        writeString(0, "RIFF");
        view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true);
        writeString(8, "WAVE");
        writeString(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, "data");
        view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true);

        // Write audio data
        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(
              -1,
              Math.min(1, audioBuffer.getChannelData(channel)[i]),
            );
            view.setInt16(
              offset,
              sample < 0 ? sample * 0x8000 : sample * 0x7fff,
              true,
            );
            offset += 2;
          }
        }

        // Convert to MP3 by changing extension and type
        const mp3Blob = new Blob([buffer], { type: "audio/mpeg" });
        resolve(mp3Blob);
      } catch (error) {
        console.error("Error converting to MP3:", error);
        // Fallback: return original webm but with .mp3 extension
        resolve(webmBlob);
      }
    });
  };

  const uploadToFireflies = async (
    audioUrl: string,
    title: string,
    blobSize: number,
  ) => {
    if (blobSize < 50 * 1024) {
      toast.error("Audio file is too small for transcription (min 50KB)");
      return;
    }

    const firefliesApiKey = import.meta.env.VITE_FIREFLIES_API_KEY;
    if (!firefliesApiKey) {
      toast.error("Fireflies API Key not found");
      return;
    }

    // secure URL (Fireflies requires https)
    const secureAudioUrl = audioUrl.startsWith("http://")
      ? audioUrl.replace("http://", "https://")
      : audioUrl;

    try {
      const response = await fetch("https://api.fireflies.ai/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firefliesApiKey}`,
        },
        body: JSON.stringify({
          query: `
        mutation($input: AudioUploadInput!) {
          uploadAudio(input: $input) {
           success
           message
          }
        }
      `,
          variables: {
            input: {
              url: secureAudioUrl,
              title: title,
              client_reference_id: meetingId, // optional
            },
          },
        }),
      });

      const uploadResult = await response.json();

      if (uploadResult.errors) {
        toast.error(uploadResult.errors[0]?.message || "Fireflies Error");
        return;
      }

      const uploadData = uploadResult.data?.uploadAudio;

      if (!uploadData?.success) {
        toast.error(uploadData?.message || "Failed to upload to Fireflies");
        return;
      }

      toast.success("Uploaded to Fireflies. Transcription started!");

      await checkTranscriptStatus(meetingId!);
    } catch (err) {
      console.error("Fireflies Upload Error:", err);
      toast.error("Fireflies upload failed");
    }
  };

  const checkTranscriptStatus = async (transcriptId: string) => {
    const firefliesApiKey = import.meta.env.VITE_FIREFLIES_API_KEY;
    const targetId = transcriptId || "01KEKRGGN7AJ4A3T5XQH7NC12M";

    try {
      const response = await fetch("https://api.fireflies.ai/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firefliesApiKey}`,
        },
        body: JSON.stringify({
          query: `
          query GetTranscript($id: String!) {
            transcript(id: $id) {
              id
              title
              host_email
              sentences {
                text
                speaker_name
                start_time
                end_time
              }
            }
          }
        `,
          variables: {
            id: targetId,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("Fireflies API Error:", result.errors);
        toast.error(result.errors[0].message);
        return;
      }

      const transcriptData = result.data?.transcript;

      if (
        transcriptData &&
        transcriptData.sentences &&
        transcriptData.sentences.length > 0
      ) {
        console.log(
          "Transcript fetched successfully!",
          transcriptData.sentences,
        );
        return transcriptData.sentences; // Yeh aapka actual text data hai
      } else {
        toast.info("Transcript is still processing or no sentences found.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const startRecording = async () => {
    try {
      // 1. Capture system/tab audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: {
          suppressLocalAudioPlayback: false,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // 2. Capture local microphone audio
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 3. Mix the audio tracks using Web Audio API
      const audioContext = new AudioContext();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const destination = audioContext.createMediaStreamDestination();

      // Connect screen/tab audio if available
      if (displayStream.getAudioTracks().length > 0) {
        const source = audioContext.createMediaStreamSource(displayStream);
        source.connect(destination);
      }

      // Connect microphone audio
      if (micStream.getAudioTracks().length > 0) {
        const source = audioContext.createMediaStreamSource(micStream);
        source.connect(destination);
      }

      // Combine tracks: Keep the mixed audio track
      const mixedStream = new MediaStream([
        ...destination.stream.getAudioTracks(),
      ]);

      // Try to use MP3 format if supported
      const mimeTypes = [
        "audio/mp3",
        "audio/mpeg",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];

      let selectedMimeType = "audio/webm";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log("Using mimeType:", mimeType);
          break;
        }
      }

      const recorder = new MediaRecorder(mixedStream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000, // 128 kbps
      });

      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      let recordingStartTime = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => {
        recordingStartTime = Date.now();
        recordingStartTimeRef.current = recordingStartTime;
        setIsRecordingLocally(true);
      };

      recorder.onstop = async () => {
        if (!meetingId) {
          toast.error("Meeting ID not found");
          return;
        }

        const recordingDuration = Date.now() - recordingStartTime;

        // Check if recording is too short (less than 15 seconds)
        if (recordingDuration < 15000) {
          toast.error(
            "Recording is too short. Please record for at least 15 seconds.",
          );

          // Stop all tracks and cleanup
          [displayStream, micStream, mixedStream].forEach((s) => {
            s.getTracks().forEach((track) => track.stop());
          });
          audioContext.close();
          mediaRecorderRef.current = null;
          setIsRecordingLocally(false);
          if (recordingTimer) {
            clearTimeout(recordingTimer);
            setRecordingTimer(null);
          }
          setCanStopRecording(false);
          return;
        }

        // Create blob from recorded chunks
        const webmBlob = new Blob(recordedChunksRef.current, {
          type: selectedMimeType,
        });

        // Check file size (minimum 50KB)
        if (webmBlob.size < 50 * 1024) {
          toast.error(
            "Recording file is too small. Please record longer audio.",
          );

          // Stop all tracks and cleanup
          [displayStream, micStream, mixedStream].forEach((s) => {
            s.getTracks().forEach((track) => track.stop());
          });
          audioContext.close();
          mediaRecorderRef.current = null;
          setIsRecordingLocally(false);
          if (recordingTimer) {
            clearTimeout(recordingTimer);
            setRecordingTimer(null);
          }
          setCanStopRecording(false);
          return;
        }

        const timestamp = Date.now();

        // Convert to MP3 for better compatibility
        const mp3Blob = await convertWebmToMp3(webmBlob);
        setRecordedBlob(mp3Blob);

        const mp3FileName = `meeting-recording-${meetingId}-${timestamp}.mp3`;
        // const webmFileName = `meeting-recording-${meetingId}-${timestamp}.webm`;

        // 🔴 STEP 1: LOCAL DOWNLOAD (MP3 format)
        downloadRecordingLocally(mp3Blob, mp3FileName);

        // 🔴 STEP 2: UPLOAD TO BACKEND (MP3 format)
        const formData = new FormData();
        formData.append("refId", meetingId);
        formData.append("imageType", "MEETING");
        formData.append("isMaster", "0");
        formData.append("fileType", "2040"); // Audio file type
        formData.append("files", mp3Blob, mp3FileName);

        try {
          // Upload to backend
          uploadDoc(formData, {
            onSuccess: async () => {
              // File uploaded successfully, now upload to Fireflies (MP3 format)
              // const audioUrl = `${ImageBaseURL}/share/mDocs/${mp3FileName}`;
              await uploadToFireflies(
                // audioUrl,
                "https://carvetheraw.com/wp-content/uploads/2024/05/listening-part-3.mp3",
                `${meetingTiming?.meetingName}`,
                mp3Blob.size,
              );
              toast.success("Recording saved and uploaded for transcription!");
            },
            onError: (error) => {
              console.error("Error uploading recording:", error);
              toast.error("Failed to save recording to server");
            },
          });
        } catch (error) {
          console.error("Error uploading recording:", error);
          toast.error("Failed to save recording");
        }

        // Stop all tracks in all streams
        [displayStream, micStream, mixedStream].forEach((s) => {
          s.getTracks().forEach((track) => track.stop());
        });
        audioContext.close();
        mediaRecorderRef.current = null;
        setIsRecordingLocally(false);
        if (recordingTimer) {
          clearTimeout(recordingTimer);
          setRecordingTimer(null);
        }
        setCanStopRecording(false);
      };

      recorder.start(1000); // Collect data every second for better size tracking

      // Update Firebase
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);
      update(meetStateRef, { isRecording: true });

      // Set minimum recording time (20 seconds)
      setCanStopRecording(false);
      const timer = setTimeout(() => {
        setCanStopRecording(true);
        toast.info("You can now stop the recording.");
      }, 20000); // 20 seconds minimum

      setRecordingTimer(timer);

      toast.success(
        "Recording started! Please record for at least 20 seconds.",
      );
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error(
        "Could not start recording. Ensure you share tab/system audio and permit microphone access.",
      );
      setIsRecordingLocally(false);
      setCanStopRecording(false);
    }
  };

  const stopRecording = () => {
    // if (!canStopRecording) {
    //   toast.error("Please record for at least 20 seconds before stopping.");
    //   return;
    // }

    // eslint-disable-next-line no-alert
    const isConfirmed = window.confirm(
      "Are you sure to store recording and stop it?",
    );

    if (!isConfirmed) return;

    // 🔴 CLEAR TIMER
    if (recordingTimer) {
      clearTimeout(recordingTimer);
      setRecordingTimer(null);
    }

    setCanStopRecording(false);

    // 🔴 STOP RECORDER DIRECTLY
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    // 🔴 Firebase sync (secondary)
    const meetStateRef = ref(db, `meetings/${meetingId}/state`);
    update(meetStateRef, { isRecording: false });
  };

  const handleDownloadRecording = () => {
    if (recordedBlob && meetingId) {
      const fileName = `meeting-recording-${meetingId}-${Date.now()}.mp3`;
      downloadRecordingLocally(recordedBlob, fileName);
    } else {
      toast.error("No recording available to download");
    }
  };

  const handleRing = () => {
    const alertsRef = ref(db, `meetings/${meetingId}/alert`);
    update(alertsRef, {
      updatedAt: Date.now(),
    });
  };

  return {
    meetingStatus: meetingTiming?.detailMeetingStatus,
    meetingId,
    meetingResponse,
    meetingTiming,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleTabChange,
    activeTab,
    isCardVisible,
    setIsCardVisible,
    handleConclusionMeeting,
    openEmployeeId,
    setOpenEmployeeId,
    handleAddTeamLeader,
    follow: meetingResponse?.state.follow,
    handleFollow,
    handleCheckIn,
    meetingNotes,
    handleUpdateNotes,
    dropdownOpen,
    setDropdownOpen,
    handleDelete,
    handleAddEmp,
    handleDeleteEmp,
    meetingData,
    handleUnFollow,
    handleFollowBack,
    handleRing,
    isShaking,
    audioRef,
    isRecording,
    startRecording,
    stopRecording,
    recordingDuration,
    isRecordingLocally,
    canStopRecording,
    handleDownloadRecording,
    hasRecording: !!recordedBlob,
    // selectedGroupFilter,
    // setSelectedGroupFilter,
  };
}
