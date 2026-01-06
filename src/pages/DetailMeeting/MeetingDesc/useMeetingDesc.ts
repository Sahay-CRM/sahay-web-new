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
import { ImageBaseURL } from "@/features/utils/urls.utils";
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
  // const [selectedGroupFilter, setSelectedGroupFilter] = useState<
  //   boolean | null
  // >(null);

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
  // const { mutate: updateMeetingTeamLeader } = addUpdateCompanyMeetingMutation();
  // const { mutate: updateTime } = addMeetingTimeMutation();
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();
  // const { mutate: addMeeting } = useAddUpdateCompanyMeeting();

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

  // useEffect(() => {
  //   if (!meetingId || !meetingResponse) return;

  //   const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

  //   const unsubscribe = onValue(meetingRef, (snapshot) => {
  //     if (snapshot.exists()) {
  //       const activeTab = snapshot.val();

  //       handleUpdatedRefresh();
  //       if (activeTab === "CONCLUSION") {
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-res"],
  //         });
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-time-by-meetingId"],
  //         });
  //       } else if (activeTab === "ENDED") {
  //         handleUpdatedRefresh();
  //       }
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [db, handleUpdatedRefresh, meetingId, meetingResponse]);

  // useEffect(() => {
  //   if (!meetingId) return;

  //   const meetingRef = ref(db, `meetings/${meetingId}/state/activeTab`);

  //   const filter = {
  //     meetingId: meetingId,
  //   };

  //   const unsubscribe = onValue(meetingRef, (snapshot) => {
  //     if (snapshot.exists()) {
  //       const activeTab = snapshot.val();

  //       handleUpdatedRefresh();

  //       const timer = setTimeout(() => {
  //         if (activeTab === "CONCLUSION") {
  //           queryClient.resetQueries({
  //             queryKey: ["get-meeting-conclusion-res"],
  //           });
  //           queryClient.resetQueries({
  //             queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
  //           });
  //         } else if (activeTab === "ENDED") {
  //           handleUpdatedRefresh();
  //         }
  //       }, 2000);

  //       return () => clearTimeout(timer);
  //     } else {
  //       const timer = setTimeout(() => {
  //         handleUpdatedRefresh();
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-res"],
  //         });
  //       }, 1000);

  //       return () => clearTimeout(timer);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [db, handleUpdatedRefresh, meetingId]);

  // useEffect(() => {
  //   if (!meetingId) return;

  //   const meetingRef = ref(db, `meetings/${meetingId}/state/status`);

  //   const filter = {
  //     meetingId: meetingId,
  //   };

  //   const unsubscribe = onValue(meetingRef, (snapshot) => {
  //     if (snapshot.exists()) {
  //       const activeTab = snapshot.val();
  //       handleUpdatedRefresh();

  //       if (activeTab === "IN_PROGRESS") {
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-res"],
  //         });
  //         queryClient.resetQueries({
  //           queryKey: ["get-meeting-conclusion-time-by-meetingId", filter],
  //         });
  //       } else if (activeTab === "ENDED") {
  //         handleUpdatedRefresh();
  //       }
  //     } else {
  //       handleUpdatedRefresh();
  //       queryClient.resetQueries({
  //         queryKey: ["get-meeting-conclusion-res"],
  //       });
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [db, handleUpdatedRefresh, meetingId]);

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
  // const handleCheckOut = (employeeId: string) => {
  //   if (meetingId) {
  //     updateTime(
  //       {
  //         meetingId: meetingId,
  //         employeeId: employeeId,
  //         attendanceMark: false,
  //         updatedAt: new Date().toISOString(),
  //       },
  //       {
  //         onSuccess: () => {
  //           if (meetingId) {
  //             const db = database;
  //             const meetRef = ref(db, `meetings/${meetingId}/state`);
  //             update(meetRef, { updatedAt: new Date() });
  //           }
  //         },
  //       }
  //     );
  //   }
  // };

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

  const isRecording = useMemo(
    () => !!meetingResponse?.state?.isRecording,
    [meetingResponse],
  );

  // Listen for isRecording change to stop recorder if it was started by this user
  useEffect(() => {
    if (
      !isRecording &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const uploadToFireflies = async (audioUrl: string, title: string) => {
    const firefliesApiKey = import.meta.env.VITE_FIREFLIES_API_KEY;
    if (!firefliesApiKey) {
      toast.error("Fireflies API key not configured");
      return;
    }

    try {
      // Step 1: Upload audio to Fireflies
      const uploadResponse = await fetch("https://api.fireflies.ai/graphql", {
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
                title
                message
              }
            }
          `,
          variables: {
            input: {
              url: audioUrl,
              title: title,
              client_reference_id: meetingId,
            },
          },
        }),
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.data?.uploadAudio?.success) {
        toast.error(
          "Failed to upload to Fireflies: " +
            uploadResult.data?.uploadAudio?.message,
        );
        return;
      }

      toast.success("Audio uploaded to Fireflies for transcription!");

      // Step 2: Poll for transcription completion
      await pollForTranscript();
    } catch (error) {
      console.error("Error uploading to Fireflies:", error);
      toast.error("Error uploading to Fireflies");
    }
  };

  const pollForTranscript = async () => {
    const firefliesApiKey = import.meta.env.VITE_FIREFLIES_API_KEY;
    if (!firefliesApiKey) return;

    const maxAttempts = 60; // Poll for up to 10 minutes (60 * 10 seconds)
    const pollInterval = 10000; // 10 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch("https://api.fireflies.ai/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firefliesApiKey}`,
          },
          body: JSON.stringify({
            query: `
              query($clientReferenceId: String!) {
                transcripts(client_reference_id: $clientReferenceId) {
                  id
                  title
                  status
                  transcript_url
                  duration
                  date
                }
              }
            `,
            variables: {
              clientReferenceId: meetingId,
            },
          }),
        });

        const result = await response.json();
        const transcripts = result.data?.transcripts || [];

        if (transcripts.length > 0) {
          const transcript = transcripts[0];
          if (transcript.status === "COMPLETE" && transcript.transcript_url) {
            // Download the transcript
            await downloadTranscript(transcript);
            return;
          } else if (transcript.status === "PROCESSING") {
            // Continue polling
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            continue;
          } else if (transcript.status === "FAILED") {
            toast.error("Transcription failed");
            return;
          }
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error("Error polling for transcript:", error);
        toast.error("Error checking transcription status");
        return;
      }
    }

    toast.error("Transcription timed out");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const downloadTranscript = async (transcript: any) => {
    try {
      // Fetch the transcript content
      const response = await fetch(transcript.transcript_url);
      const transcriptText = await response.text();

      // Create and download the file
      const blob = new Blob([transcriptText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcript-${meetingId}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Transcript downloaded successfully!");
    } catch (error) {
      console.error("Error downloading transcript:", error);
      toast.error("Failed to download transcript");
    }
  };

  const startRecording = async () => {
    try {
      // 1. Capture system/tab audio
      // Note: video: true is required for the picker to show up in most browsers.
      // We use preferCurrentTab to make it easier to share the meeting tab.
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

      const recorder = new MediaRecorder(mixedStream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (!meetingId) {
          toast.error("Meeting ID not found");
          return;
        }

        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const timestamp = Date.now();
        const fileName = `meeting-full-mixed-audio-${meetingId}-${timestamp}.webm`;

        // Upload to backend first
        const formData = new FormData();
        formData.append("refId", meetingId);
        formData.append("imageType", "MEETING");
        formData.append("isMaster", "0");
        formData.append("fileType", "2040"); // Audio file type
        formData.append("files", blob, fileName);

        try {
          // Upload to backend
          uploadDoc(formData, {
            onSuccess: async () => {
              // File uploaded successfully, now upload to Fireflies
              const audioUrl = `${ImageBaseURL}/share/mDocs/${fileName}`;
              await uploadToFireflies(
                audioUrl,
                `Meeting Recording - ${meetingId}`,
              );
              toast.success("Recording saved and uploaded for transcription!");
            },
            onError: (error) => {
              console.error("Error uploading recording:", error);
              toast.error("Failed to save recording");
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
      };

      recorder.start();

      // Update Firebase
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);
      update(meetStateRef, { isRecording: true });

      toast.success(
        "Recording started! IMPORTANT: Ensure you checked 'Share tab audio' in the browser popup.",
      );
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error(
        "Could not start recording. Ensure you share tab/system audio and permit microphone access.",
      );
    }
  };

  const stopRecording = () => {
    // eslint-disable-next-line no-alert
    const isConfirmed = window.confirm(
      "Are you sure to store recording and stop it?",
    );
    if (isConfirmed) {
      const meetStateRef = ref(db, `meetings/${meetingId}/state`);
      update(meetStateRef, { isRecording: false });
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
    // handleTimeUpdate,
    handleConclusionMeeting,
    openEmployeeId,
    setOpenEmployeeId,
    handleAddTeamLeader,
    // handleCheckOut,
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
    // selectedGroupFilter,
    // setSelectedGroupFilter,
  };
}
