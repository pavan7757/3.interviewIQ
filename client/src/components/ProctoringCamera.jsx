import React, { useRef, useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

/**
 * ProctoringCamera
 * Camera access + face presence detection for interview integrity.
 *
 * SETUP REQUIRED:
 * 1. npm install face-api.js
 * 2. Download face-api.js models and put them in your public folder,
 *    e.g. public/models/
 *    Models needed (from https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
 *    - tiny_face_detector_model-*
 * 3. Adjust MODEL_URL below to match your public path (e.g. "/models")
 */

const MODEL_URL = "/models";
const CHECK_INTERVAL_MS = 1500; // how often to run detection
const ABSENCE_THRESHOLD_MS = 4000; // how long face must be missing before flagging
const MULTI_FACE_THRESHOLD_MS = 2000; // how long multiple faces must be seen before flagging

export default function ProctoringCamera({ onViolation }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const noFaceStartRef = useRef(null);
  const multiFaceStartRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [status, setStatus] = useState("initializing"); // initializing | ok | no_face | multi_face
  const [violationLog, setViolationLog] = useState([]);

  const logViolation = useCallback(
    (type) => {
      const entry = { type, timestamp: new Date().toISOString() };
      setViolationLog((prev) => [...prev, entry]);
      if (onViolation) onViolation(entry);
    },
    [onViolation]
  );

  // Load models once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        if (!cancelled) setModelsLoaded(true);
      } catch (err) {
        if (!cancelled) setCameraError("Failed to load detection models: " + err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Start camera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(
          "Camera access denied or unavailable: " + err.message
        );
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Run detection loop once models + camera are ready
  useEffect(() => {
    if (!modelsLoaded || cameraError) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      const now = Date.now();

      if (detections.length === 0) {
        // no face
        if (!noFaceStartRef.current) noFaceStartRef.current = now;
        multiFaceStartRef.current = null;

        if (now - noFaceStartRef.current >= ABSENCE_THRESHOLD_MS) {
          setStatus("no_face");
          logViolation("face_not_visible");
          noFaceStartRef.current = now; // reset to avoid spamming logs every tick
        }
      } else if (detections.length > 1) {
        // multiple faces
        if (!multiFaceStartRef.current) multiFaceStartRef.current = now;
        noFaceStartRef.current = null;

        if (now - multiFaceStartRef.current >= MULTI_FACE_THRESHOLD_MS) {
          setStatus("multi_face");
          logViolation("multiple_faces_detected");
          multiFaceStartRef.current = now;
        }
      } else {
        // exactly one face - all good
        noFaceStartRef.current = null;
        multiFaceStartRef.current = null;
        setStatus("ok");
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, cameraError, logViolation]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 480 }}>
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            borderRadius: 8,
            border:
              status === "no_face" || status === "multi_face"
                ? "3px solid #e53e3e"
                : "3px solid #38a169",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            background:
              status === "ok"
                ? "rgba(56,161,105,0.9)"
                : status === "initializing"
                ? "rgba(113,128,150,0.9)"
                : "rgba(229,62,62,0.9)",
          }}
        >
          {status === "initializing" && "Starting camera..."}
          {status === "ok" && "Candidate visible"}
          {status === "no_face" && "⚠ Face not visible"}
          {status === "multi_face" && "⚠ Multiple people detected"}
        </div>
      </div>

      {cameraError && (
        <p style={{ color: "#e53e3e", fontSize: 13 }}>{cameraError}</p>
      )}

      {violationLog.length > 0 && (
        <details style={{ fontSize: 12 }}>
          <summary>{violationLog.length} violation(s) logged</summary>
          <ul>
            {violationLog.map((v, i) => (
              <li key={i}>
                {v.type} — {new Date(v.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}