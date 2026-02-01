'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { interviews, type Interview } from '@/lib/api';

// Polyfill types for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function TakeInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  
  // New States
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load Interview
  useEffect(() => {
    if (!id) return;
    interviews
      .get(id)
      .then((data) => {
        setInterview(data);
        if (data.status === 'completed') {
          setCompleted(true);
          setOverallScore(data.overallScore ?? null);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const questions = interview?.questions ?? [];

  // Start Interview Process
  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Recorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setIsStarted(true);
      setIsRecording(true);
      
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            }
          }
          if (final) {
            setTranscript(prev => prev + ' ' + final);
          }
        };
        
        recognitionRef.current = recognition;
      }

      // Start first question
      speakQuestion(questions[0]?.question);
      startQuestionLogic();

    } catch (err) {
      console.error(err);
      setError('Could not access camera/microphone. Please allow permissions.');
    }
  };

  const startQuestionLogic = () => {
    setTimeLeft(60);
    setTranscript('');
    
    // Start recognition for this question
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }
  };

  const speakQuestion = (text?: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Timer Effect
  useEffect(() => {
    if (!isStarted || completed || submitting) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion(); // Auto-advance
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, completed, submitting, currentIndex]); // Removed handleNextQuestion from dep to avoid loop

  const handleNextQuestion = async () => {
    if (submitting) return; // Prevent double submit
    setSubmitting(true);
    
    // Stop recognition to finalize transcript
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      // Submit current answer
      await interviews.submitResponse(id, currentIndex, transcript.trim() || 'No answer provided');
      
      if (currentIndex < questions.length - 1) {
        // Next Question
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setSubmitting(false);
        speakQuestion(questions[nextIndex].question);
        startQuestionLogic();
      } else {
        // Finish Interview
        finishInterview();
      }
    } catch (err) {
      setError('Failed to submit answer. Retrying...');
      setSubmitting(false);
    }
  };

  const finishInterview = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        uploadInterview(blob);
      };
    } else {
      uploadInterview(null);
    }
  };

  const uploadInterview = async (blob: Blob | null) => {
    try {
      setSubmitting(true);
      const res = await interviews.complete(id, blob || undefined);
      setInterview(res);
      setCompleted(true);
      setOverallScore(res.overallScore ?? null);
      
      // Stop streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      setError('Failed to upload interview.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading interview setup...</div>;
  if (!interview) return <div className="p-8 text-center text-red-500">Interview not found</div>;

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-green-400">Interview Completed!</h1>
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
          <p className="text-slate-400 mb-2">Your AI Score</p>
          <div className="text-6xl font-bold text-white mb-4">{overallScore ?? 0}/100</div>
          <p className="text-sm text-slate-500">
            Your responses and video have been recorded for the recruiter.
          </p>
        </div>
        <Link 
          href="/dashboard/candidate/interviews" 
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold">AI Video Interview</h1>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-left space-y-4">
          <h3 className="text-xl font-semibold">Instructions:</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>Ensure you are in a quiet environment.</li>
            <li>Enable your camera and microphone.</li>
            <li>There are {questions.length} questions.</li>
            <li>You have 1 minute to answer each question.</li>
            <li>Questions will be read out loud automatically.</li>
          </ul>
        </div>
        {error && <p className="text-red-400">{error}</p>}
        <button
          onClick={startInterview}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold text-lg shadow-lg shadow-green-900/20 transition-all"
        >
          Start Interview & Open Camera
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Question {currentIndex + 1} of {questions.length}</h2>
          <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden w-48">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Camera Feed */}
        <div className="flex-1 relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
          />
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            REC
          </div>
        </div>

        {/* Question & Controls */}
        <div className="md:w-96 flex flex-col gap-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex-1 flex flex-col justify-center text-center">
            <p className="text-sm text-slate-400 mb-4 uppercase tracking-wider">Current Question</p>
            <h3 className="text-xl font-medium text-white leading-relaxed">
              {questions[currentIndex]?.question}
            </h3>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-h-[100px]">
             <p className="text-xs text-slate-500 mb-2">Live Transcript (AI Hearing):</p>
             <p className="text-sm text-slate-300 italic">
               {transcript || "Listening..."}
             </p>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={submitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait rounded-xl font-bold text-white shadow-lg transition-all active:scale-95"
          >
            {submitting ? 'Processing...' : currentIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  );
}